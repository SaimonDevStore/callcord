import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const me = await currentProfilePages(req);
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const { toProfileId } = req.body as { toProfileId: string };
    if (!toProfileId) return res.status(400).json({ error: 'toProfileId required' });

    const notifyKey = `call:invite:${toProfileId}`;
    res?.socket?.server?.io?.emit(notifyKey, { fromName: me.name, fromProfileId: me.id });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error' });
  }
}


