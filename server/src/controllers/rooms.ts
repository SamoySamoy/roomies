import { Response } from 'express';
import { db } from '@/prisma/db';
import { MemberRole, Room, RoomType } from '@prisma/client';
import {
  createMsg,
  getFileName,
  isTruthy,
  mkdirIfNotExist,
  removeIfExist,
  uuid,
} from '@/lib/utils';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import path from 'path';
import fsPromises from 'fs/promises';
import { AuthenticatedRequest } from '@/lib/types';
import { AVATAR_HEIGHT, AVATAR_WIDTH } from '@/lib/constants';

type QueryInclude = {
  profile: string;
  members: string;
  profilesOfMembers: string;
  groups: string;
};

type QueryFilter = {
  status: 'created' | 'joined' | 'all';
  roomType: RoomType | 'viewable' | 'all';
};

// Get all servers
export const getRooms = async (
  req: AuthenticatedRequest<any, any, Partial<QueryInclude & QueryFilter>>,
  res: Response,
) => {
  try {
    const {
      profile,
      members,
      profilesOfMembers,
      groups,
      status = 'joined',
      roomType = 'all',
    } = req.query;
    const profileId = req.user?.profileId!;

    // Tìm kiếm theo 2 điều kiện độc lập
    // 1. Tìm kiếm theo kiểu room
    const roomFilterListMap: Record<typeof roomType, RoomType[]> = {
      PUBLIC: [RoomType.PUBLIC],
      PRIVATE: [RoomType.PRIVATE],
      HIDDEN: [RoomType.HIDDEN],
      viewable: [RoomType.PUBLIC, RoomType.PRIVATE],
      all: Object.keys(RoomType) as RoomType[],
    };
    // 2. Tìm kiếm theo cá nhân (profileId) hoặc không
    // Nếu có profileId, sẽ có 2 trạng thái tìm kiếm: tìm kiếm những room mà profileId join và tìm kiếm những room mà profileId create
    const statusFilterMap: Record<typeof status, Record<string, any>> = {
      joined: {
        members: {
          some: {
            profileId,
          },
        },
      },
      created: {
        profileId,
      },
      all: {},
    };

    const rooms = await db.room.findMany({
      where: {
        AND: [
          statusFilterMap[status],
          {
            type: {
              in: roomFilterListMap[roomType],
            },
          },
        ],
      },
      include: {
        profile: isTruthy(profile),
        members: isTruthy(members)
          ? {
              include: {
                profile: isTruthy(profilesOfMembers),
              },
              orderBy: {
                createdAt: 'desc',
              },
            }
          : false,
        groups: isTruthy(groups)
          ? {
              orderBy: {
                createdAt: 'asc',
              },
            }
          : false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};

type ParamsRoomId = {
  roomId: string;
};
// Get a room by roomId
export const getRoomByRoomId = async (
  req: AuthenticatedRequest<ParamsRoomId, any, Partial<QueryInclude>>,
  res: Response,
) => {
  try {
    const roomId = req.params.roomId;
    const { profile, members, profilesOfMembers, groups } = req.query;
    const room = await db.room.findUnique({
      where: { id: roomId },
      include: {
        profile: isTruthy(profile),
        members: isTruthy(members)
          ? {
              include: {
                profile: isTruthy(profilesOfMembers),
              },
              orderBy: {
                createdAt: 'desc',
              },
            }
          : false,
        groups: isTruthy(groups)
          ? {
              orderBy: {
                createdAt: 'asc',
              },
            }
          : false,
      },
    });

    if (!room) {
      return res.status(404).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Room not found',
        }),
      );
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};

type BodyCreateServer = {
  roomName: string;
  roomType: RoomType;
  roomPassword: string;
};

// Create new room
export const createRoom = async (
  req: AuthenticatedRequest<any, Partial<BodyCreateServer>, any>,
  res: Response,
) => {
  try {
    const { roomName, roomPassword = '' } = req.body;
    let { roomType = 'PUBLIC' } = req.body;
    const profileId = req.user?.profileId!;

    if (!roomName || !profileId) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Need room name, type, profile id',
        }),
      );
    }
    roomType = roomType.toUpperCase() as RoomType;

    if (!req.file) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Require room image',
        }),
      );
    }

    if (!Object.keys(RoomType).includes(roomType)) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Invalid room type',
        }),
      );
    }
    if (roomType === 'PRIVATE' && !roomPassword) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Require password for private room',
        }),
      );
    }

    const profile = await db.profile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });
    if (!profile) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Profile not found',
        }),
      );
    }

    const image = req.file!;
    const relFolderPath = '/public/rooms';
    const absFolderPath = path.join(__dirname, '..', '..', relFolderPath);

    const imageName = `${getFileName(image.originalname)}_${uuid()}.webp`;
    const relImagePath = path.join(relFolderPath, imageName);
    const absImagePath = path.join(absFolderPath, imageName);

    await mkdirIfNotExist(absFolderPath);
    await sharp(image.buffer).resize(AVATAR_WIDTH, AVATAR_HEIGHT).webp().toFile(absImagePath);

    const hashedPassword = roomType === 'PRIVATE' ? await bcrypt.hash(roomPassword, 10) : '';
    const newRoom = await db.room.create({
      data: {
        name: roomName,
        type: roomType,
        password: hashedPassword,
        imageUrl: relImagePath,
        inviteCode: uuid(),
        profileId: profile.id,
        members: {
          create: [{ role: MemberRole.ADMIN, profileId: profile.id }],
        },
        groups: {
          create: [{ name: 'default', profileId: profile.id }],
        },
      },
      include: {
        profile: true,
        members: true,
        groups: true,
      },
    });

    return res.status(200).json(newRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};

type BodyJoin = {
  roomPassword: string;
};

// join room
export const joinRoom = async (
  req: AuthenticatedRequest<ParamsRoomId, Partial<BodyJoin>>,
  res: Response,
) => {
  try {
    const { roomId } = req.params;
    const { roomPassword } = req.body;
    const profileId = req.user?.profileId!;

    const [profile, room] = await Promise.all([
      db.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      }),
      db.room.findFirst({
        where: { id: roomId },
        include: {
          members: true,
        },
      }),
    ]);

    if (!profile) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Profile not found',
        }),
      );
    }
    if (!room) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Room not found',
        }),
      );
    }

    const isAlreadyJoinServer = room.members.find(mem => mem.profileId === profile.id);
    if (isAlreadyJoinServer) {
      return res.status(204).json(
        createMsg({
          type: 'success',
          successMessage: 'Profile already join this room',
        }),
      );
    }

    // Có 3 loại room PUBLIC, PRIVATE, HIDDEN
    // PUBLIC: invite code || no password
    // PRIVATE: invite code || password
    // HIDDEN: invite code (chỉ có thể join bằng invite code)
    // Invite code đã có route ở dưới
    const updateRoom = async () => {
      const updatedRoom = await db.room.update({
        where: {
          id: room.id,
        },
        data: {
          members: {
            create: [
              {
                profileId: profile.id,
              },
            ],
          },
        },
      });
      return updatedRoom;
    };
    switch (room.type) {
      case 'PUBLIC': {
        return res.status(200).json(await updateRoom());
      }
      case 'PRIVATE': {
        if (!roomPassword) {
          return res.status(400).json(
            createMsg({
              type: 'invalid',
              invalidMessage: 'Require password for private room',
            }),
          );
        }
        const isRightPassword = await bcrypt.compare(roomPassword, room.password!);
        if (!isRightPassword) {
          return res.status(400).json(
            createMsg({
              type: 'invalid',
              invalidMessage: 'Unauthenticated permission for private room',
            }),
          );
        }
        return res.status(200).json(await updateRoom());
      }
      default: {
        return res.status(400).json(
          createMsg({
            type: 'invalid',
            invalidMessage: 'Can not join room',
          }),
        );
      }
    }
    // Can not join hidden room without invite code
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};

type ParamsInviteCode = { inviteCode: string };

// join room by inviteCode
export const joinRoomByInviteCode = async (
  req: AuthenticatedRequest<ParamsInviteCode, any, any>,
  res: Response,
) => {
  try {
    const { inviteCode } = req.params;
    const profileId = req.user?.profileId!;

    const [profile, room] = await Promise.all([
      db.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      }),
      db.room.findFirst({
        where: {
          inviteCode,
        },
        include: {
          members: true,
        },
      }),
    ]);
    if (!profile) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Profile not found',
        }),
      );
    }
    if (!room) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Room not found or Invite code not exist',
        }),
      );
    }
    const isAlreadyJoinServer = room.members.find(mem => mem.profileId === profile.id);
    if (isAlreadyJoinServer) {
      return res.status(204).json(
        createMsg({
          type: 'success',
          successMessage: 'Profile already join this room',
        }),
      );
    }

    const updatedRoom = await db.room.update({
      where: {
        id: room.id,
      },
      data: {
        members: {
          create: [
            {
              profileId: profile.id,
            },
          ],
        },
      },
    });
    return res.status(200).json(updatedRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};

// Leave room
export const leaveRoom = async (
  req: AuthenticatedRequest<ParamsRoomId, any, any>,
  res: Response,
) => {
  try {
    const { roomId } = req.params;
    const profileId = req.user?.profileId;

    const [profile, room] = await Promise.all([
      db.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      }),
      db.room.findFirst({
        where: {
          id: roomId,
        },
        include: {
          members: true,
        },
      }),
    ]);
    if (!profile) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Profile not found',
        }),
      );
    }
    if (!room) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Room not exist',
        }),
      );
    }
    if (room.profileId === profile.id) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Can not leave room that created by yourself',
        }),
      );
    }

    const updatedRoom = await db.room.update({
      where: {
        id: room.id,
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });
    return res.status(200).json(updatedRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};

// Update a room by roomId
export const updateRoom = async (
  req: AuthenticatedRequest<ParamsRoomId, Partial<BodyCreateServer>, any>,
  res: Response,
) => {
  try {
    const { roomId } = req.params;
    const { roomName: newRoomName, roomPassword: newServerPassword = '' } = req.body;
    let { roomType: newRoomType } = req.body;
    const profileId = req.user?.profileId!;

    const room = await db.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!room) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Room not exist',
        }),
      );
    }
    // Only the room creatator can update room
    if (room.profileId !== profileId) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Only Admin can update room',
        }),
      );
    }

    const updatedData: Partial<Room> = {};

    if (newRoomName) {
      updatedData.name = newRoomName;
    }
    if (newRoomType) {
      newRoomType = newRoomType.toUpperCase() as RoomType;
      if (!Object.keys(RoomType).includes(newRoomType)) {
        return res.status(400).json(
          createMsg({
            type: 'invalid',
            invalidMessage: 'Invalid room type',
          }),
        );
      }
      if (newRoomType === 'PRIVATE' && !newServerPassword) {
        return res.status(400).json(
          createMsg({
            type: 'invalid',
            invalidMessage: 'Require password for private room',
          }),
        );
      }
      const hashedPassword =
        newRoomType === 'PRIVATE' ? await bcrypt.hash(newServerPassword, 10) : '';
      updatedData.password = hashedPassword;
      updatedData.type = newRoomType;
    }

    if (
      req.files !== undefined &&
      Array.isArray(req.files) &&
      req.files[0]?.fieldname === 'roomImage'
    ) {
      const image = req.files[0];
      const imageName = `${getFileName(image.originalname)}_${uuid()}.webp`;
      const relFolderPath = '/public/rooms';
      const absFolderPath = path.join(__dirname, '..', '..', relFolderPath);
      const relImagePath = path.join(relFolderPath, imageName);
      const absImagePath = path.join(absFolderPath, imageName);

      await mkdirIfNotExist(absFolderPath);
      await sharp(image.buffer).resize(AVATAR_WIDTH, AVATAR_HEIGHT).webp().toFile(absImagePath);
      if (room.imageUrl) {
        const oldImagePath = path.join(absFolderPath, room.imageUrl);
        removeIfExist(oldImagePath);
      }

      updatedData.imageUrl = relImagePath;
    }

    const updatedRoom = await db.room.update({
      where: {
        id: room.id,
      },
      data: updatedData,
    });

    return res.status(200).json(updatedRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};

// Delete a room by roomId
export const deleteRoom = async (
  req: AuthenticatedRequest<ParamsRoomId, any, any>,
  res: Response,
) => {
  try {
    const roomId = req.params.roomId;
    const profileId = req.user?.profileId!;

    const room = await db.room.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      return res.status(400).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Room not found',
        }),
      );
    }
    // Only the room creatator can update room
    if (room.profileId !== profileId) {
      return res.status(403).json(
        createMsg({
          type: 'invalid',
          invalidMessage: 'Only Admin can delete room',
        }),
      );
    }

    await db.room.delete({
      where: {
        id: roomId,
      },
    });

    return res.status(200).send(
      createMsg({
        type: 'success',
        successMessage: 'Room deleted successfully',
      }),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createMsg({
        type: 'error',
      }),
    );
  }
};
