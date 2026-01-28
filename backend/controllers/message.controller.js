import {Conversation} from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {Message} from "../models/message.model.js"
// for chatting
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

  // message.controller.js
const receiverSocketId = getReceiverSocketId(receiverId.toString());
if (receiverSocketId) {
  io.to(receiverSocketId).emit("newMessage", {
    ...newMessage.toObject(),
    conversationId: conversation._id,   // ✅ add this
  });
}


    console.log("MSG:", {
  senderId,
  receiverId,
  receiverSocketId: getReceiverSocketId(receiverId),
});
    return res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
};

export const getMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all: [senderId, receiverId]}
        }).populate('messages');
        if(!conversation) return res.status(200).json({success:true, messages:[]});

        return res.status(200).json({success:true, messages:conversation?.messages});
        
    } catch (error) {
        console.log(error);
    }
}