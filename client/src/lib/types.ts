// AUTO GENERATED FILE BY @kalissaac/prisma-typegen
// DO NOT EDIT

export type ServerType = 'public' | 'private' | 'hidden';

export type MemberRole = 'admin' | 'moderator' | 'guest';

export type ChannelType = 'text' | 'audio' | 'video';

export interface Profile {
  id: string;
  email: string;
  password: string;
  ip?: string;
  imageUrl?: string;
  servers: Server[];
  members: Member[];
  channels: Channel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Server {
  id: string;
  name: string;
  type: ServerType;
  imageUrl?: string;
  inviteCode?: string;
  profileId: string;
  profile: Profile;
  members: Member[];
  channels: Channel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  role: MemberRole;
  profileId: string;
  // profile: Profile;
  serverId: string;
  server: Server;
  messages: Message[];
  directMessages: DirectMessage[];
  conversationsInitiated: Conversation[];
  conversationsReceived: Conversation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  profileId: string;
  profile: Profile;
  serverId: string;
  server: Server;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  fileUrl?: string;
  memberId: string;
  member: Member;
  channelId: string;
  channel: Channel;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  memberOneId: string;
  memberOne: Member;
  memberTwoId: string;
  memberTwo: Member;
  directMessages: DirectMessage[];
}

export interface DirectMessage {
  id: string;
  content: string;
  fileUrl?: string;
  memberId: string;
  member: Member;
  conversationId: string;
  conversation: Conversation;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
