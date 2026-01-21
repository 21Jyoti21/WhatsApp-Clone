import getPrismaInstance from "../utils/PrismaClient.js";
export const addCallLog = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const {
      callerId,
      calleeId,
      direction,
      callType,
      status,
      createdAt,
    } = req.body;

    if (!callerId || !calleeId || !callType || !direction) {
      return res
        .status(400)
        .json({ msg: "callerId, calleeId, callType and direction are required" });
    }

    const log = await prisma.callLog.create({
      data: {
        callerId: parseInt(callerId),
        calleeId: parseInt(calleeId),
        direction,
        callType,
        status: status || "ended",
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    return res.status(201).json({ log });
  } catch (err) {
    next(err);
  }
};
export const getCallLogsForUser = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const userId = parseInt(req.params.userId);

    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }
    const logs = await prisma.callLog.findMany({
      where: {
        OR: [{ callerId: userId }, { calleeId: userId }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        caller: true,
        callee: true,
      },
    });
    const normalized = logs.map((log) => {
      const isCaller = log.callerId === userId;
      const otherUser = isCaller ? log.callee : log.caller;
      return {
        id: log.id,
        withUserId: otherUser.id,
        withUserName: otherUser.name,
        direction: isCaller ? "outgoing" : "incoming",
        callType: log.callType,
        status: log.status,
        createdAt: log.createdAt,
      };
    });
    return res.status(200).json({ logs: normalized });
  } catch (err) {
    next(err);
  }
};