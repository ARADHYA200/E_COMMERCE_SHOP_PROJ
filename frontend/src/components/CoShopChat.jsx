import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const SOCKET_URL = (
  import.meta.env.VITE_API_URL ||
  "https://e-commerce-shop-proj.onrender.com/api"
).replace(/\/api\/?$/, "");

const CoShopChat = ({ room, user, onRoomUpdated }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [roomStatus, setRoomStatus] = useState(room.status);
  const [loading, setLoading] = useState(
    () => Boolean(user?.token && room?._id)
  );

  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const token = user?.token;

    if (!token || !room?._id) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);

      socket.emit("chat:join", { roomId: room._id }, (result) => {
        setLoading(false);

        if (!result?.ok) {
          toast.error(result?.message || "Could not open chat");
          return;
        }

        setMessages(result.messages || []);
        setRoomStatus(result.status || room.status);
      });
    });

    socket.on("connect_error", (error) => {
      setConnected(false);
      setLoading(false);
      console.error("Co-Shop socket connection:", error.message);
      toast.error("Chat connection failed. Check login and backend.");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Receive new chat messages in real time
    socket.on("chat:message", (message) => {
      if (String(message.room) !== String(room._id)) return;

      setMessages((previous) => {
        if (previous.some((item) => item._id === message._id)) {
          return previous;
        }

        return [...previous, message];
      });
    });

    // Receive updated room products, votes, members and status
    socket.on("room:updated", (updatedRoom) => {
      if (String(updatedRoom?._id) !== String(room._id)) return;

      setRoomStatus(updatedRoom.status);

      // Update the parent Co-Shop page
      onRoomUpdated?.(updatedRoom);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room?._id, room.status, user?.token, onRoomUpdated]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
        container.scrollTop = container.scrollHeight;
    }
    }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    const cleanText = text.trim();

    if (
      !cleanText ||
      sending ||
      !connected ||
      roomStatus !== "active" ||
      !socketRef.current
    ) {
      return;
    }

    setSending(true);

    socketRef.current.emit(
      "chat:send",
      { roomId: room._id, text: cleanText },
      (result) => {
        setSending(false);

        if (!result?.ok) {
          toast.error(result?.message || "Failed to send message");
          return;
        }

        setText("");
      }
    );
  };

  const myId = user?._id || user?.id;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-bold">Room Chat 💬</h3>

          <p className="text-xs text-gray-500">
            {connected
              ? "Connected · Live messages"
              : "Connecting..."}
          </p>
        </div>

        <span
          className={`h-2.5 w-2.5 rounded-full ${
            connected ? "bg-green-500" : "bg-yellow-500"
          }`}
        />
      </div>

      <div className="h-80 space-y-4 overflow-y-auto p-4 sm:h-96">
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">
            Loading chat...
          </p>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl">💬</div>

            <p className="mt-3 font-semibold">
              Start the conversation
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Discuss products and decide together.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const senderId = message.sender?._id || message.sender;
            const mine = String(senderId) === String(myId);

            return (
              <div
                key={message._id}
                className={`flex ${
                  mine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    mine
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  <p
                    className={`mb-1 text-xs ${
                      mine ? "text-indigo-100" : "text-gray-500"
                    }`}
                  >
                    {mine ? "You" : message.sender?.name || "Member"}
                  </p>

                  <p className="whitespace-pre-wrap break-words text-sm">
                    {message.text}
                  </p>

                  <p
                    className={`mt-2 text-right text-[10px] ${
                      mine ? "text-indigo-100" : "text-gray-500"
                    }`}
                  >
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
    <div
    ref={messagesContainerRef}
    className="h-80 space-y-4 overflow-y-auto p-4 sm:h-96"
    ></div>
      </div>

      <form
        onSubmit={sendMessage}
        className="flex gap-2 border-t border-gray-200 p-3 dark:border-gray-800"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder={
            roomStatus === "closed"
              ? "This room is closed"
              : connected
              ? "Type a message..."
              : "Connecting to chat..."
          }
          disabled={
            !connected || roomStatus !== "active" || sending
          }
          className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-gray-700"
        />

        <button
          type="submit"
          disabled={
            !connected ||
            !text.trim() ||
            sending ||
            roomStatus !== "active"
          }
          className="rounded-xl bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </section>
  );
};

export default CoShopChat;
