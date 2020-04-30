import assert, {AssertionError} from 'assert';
import { Types } from 'mongoose';

import Group, {GroupDocument} from "../models/group";
import Socket  from "../models/socket";
import Message from "../models/message";

import config from from '../../config/server';
import getRandomAvatar from "../../utils/getRandomAvatar";
import {KoaContext} from "../../types/koa";

const { isValid } = Types.ObjectId;

async function getGroupOnlineMembersHelper(group: GroupDocument) {
    const sockets = await Socket.find(
        { user: group.members },
        {
            os: 1,
            browser: 1,
            environment: 1,
            user: 1,
        },
    ).populate('user', { username: 1, avatar: 1 });
    const filterSockets = sockets.reduce((result, socket) => {
        result.set(sockets.user.toString(), socket);
        return result;
    }, new Map());
    return Object.values(filterSockets);
}

interface  CreateGroupData {
    name: string;
}

export async function createGroup(ctx: KoaContext<CreateGroupData>) {
    const ownGroupCount = await Group.count({creator: ctx.scoket.user});
    assert(
      ownGroupCount < config.maxGroupsCount,
        `创建群组失败, 你已经创建了${config.maxGroupsCount}个群组`,
    );
    const { name } = ctx.data;
    assert(name, '群组名不能为空');

    const group = await Group.findOne({name});
    assert(!group, '该群组已存在');

    let newGrop = null;
    try{
        newGrop = await  Group.create({
            name,
            avatar: getRandomAvatar(),
            creator: ctx.socket.user,
            members: [ctx.socket.user],
        });
    }catch (err) {
        if(err.name === 'ValidationError') {
            return '群组名包含不支持的字符或者长度超过限制';
        }
        throw err;
    }

    ctx.socket.join(newGrop._id.toString());
    return {
        _id: newGrop._id,
        name: newGrop.name,
        avatar: newGrop.avatar,
        createTime: newGrop.createTime,
        creator: newGrop.creator,
    };
}

interface LeaveGroupData {
    groupId: string;
}

export async function leaveGroup(ctx: KoaContext<LeaveGroupData>) {
    const {groupId} = ctx.data;
    assert(isValid(groupId), '无效的群组ID');

    const group =await Group.findOne({_id: groupId});
    if(!group) {
        throw new AssertionError({message: '群组不存在'});
    }

    if(group.creator) {
        assert(
          group.creator.toString() !== ctx.socket.user.toString(),
        );
    }

    const index = group.mebers.indexOf(ctx.socket.user);
    assert(index !== -1, '你不在群组中');

    group.members.splice(index, 1);
    await  group.save();

    ctx.socket.leave(group._id.tosString());

    return {};
}

interface GetGroupOnLineMembersData {
    groupId: string;
}

export async function getGroupOnlineMembers(ctx: KoaContext<GetGroupOnLineMembersData>) {
    const { groupId } =ctx.data;
    assert(isValid(groupId), '无效的群组ID');

    const group = await Group.findOne({_id: groupId});
    if(!group) {
        throw new AssertionError('群组不存在');
    }
    return getGroupOnlineMembersHelper(group);
}

export async function getDefaultGroupOnlineMembers() {
    const group = await  Group.findOne({isDefault: true});
    if(!group) {
        throw new AssertionError('群组不存在');
    }
    return getGroupOnlineMembersHelper(group);
}

interface ChangeGroupAvatarData  {
    groupId : string;
    avatar: string;
}

export async  function changeGroupAvatar(ctx: KoaContext<ChangeGroupAvatarData>){
    const { groupId, avatar } = ctx.data;
    assert(isValid(groupId), '无效的群组ID');
    assert(avatar, '头像地址不能为空');

    const group = await  Group.findOne({_id: groupId});
    if(!group) {
        throw new AssertionError({message: '群组不存在'});
    }
    assert(group.creator.toString() === ctx.socket.user.toString(),'只有群主才能修改头像');

    await Group.updateOne({ _id: groupId} ,{avatar});
    return {};
}

interface ChangeGroupNameData {
    groupId: string;
    name: string;
}

export async  function changeGroupName(ctx: KoaContext<ChangeGroupNameData>){
    const {groupId, name } = ctx.data;
    assert(isValid(groupId), '无效的群组ID');
    assert(name, '群组名称不能为空');

    const group = await  Group.findOne({ _id: groupId});
    if(!group) {
        throw new AssertionError({message: '群组不存在'})
    }
    assert(group.name !== name, '新群组名不能和之前一致');
    assert(group.creator.toString() === ctx.socket.user.toString(), '只有群主才能修改头像');

    const targetGroup = await Group.findOne({ name });
    assert(!targetGroup, '该群组名已存在');

    await Group.updateOne({ _id: groupId }, { name });

    ctx.socket.to(groupId).emit('changeGroupName', { groupId, name });

    return {};
}

interface DeleteGroupData {
    /** 目标群组id */
    groupId: string;
}

/**
 * 删除群组, 只有群创建者有权限
 * @param ctx Context
 */
export async function deleteGroup(ctx: KoaContext<DeleteGroupData>) {
    const { groupId } = ctx.data;
    assert(isValid(groupId), '无效的群组ID');

    const group = await Group.findOne({ _id: groupId });
    if (!group) {
        throw new AssertionError({ message: '群组不存在' });
    }
    assert(group.creator.toString() === ctx.socket.user.toString(), '只有群主才能解散群组');
    assert(group.isDefault !== true, '默认群组不允许解散');

    await group.remove();

    ctx.socket.to(groupId).emit('deleteGroup', { groupId });

    return {};
}

