import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CoShopChat from "../components/CoShopChat";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

const CoShop = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [products, setProducts] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);

  const [searchParams] = useSearchParams();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;

  useEffect(() => {
    const code = searchParams.get("invite");
    if (code) setInviteCode(code);
  }, [searchParams]);

  const loadRooms = useCallback(async () => {
    try {
      const { data } = await API.get("/co-shop/my-rooms");
      setRooms(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load rooms"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load products");
    }
  }, []);

  useEffect(() => {
    loadRooms();
    loadProducts();
  }, [loadRooms, loadProducts]);

  // Restore the selected room from the URL so refreshing /co-shop/:roomId
  // keeps the user inside the same room.
  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      return undefined;
    }

    let cancelled = false;
    setRoom(null);

    const restoreRoom = async () => {
      try {
        setBusy(true);
        const { data } = await API.get(`/co-shop/${roomId}`);
        if (!cancelled) {
          setRoom(data);
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error.response?.data?.message || "Failed to restore room"
          );
          navigate("/co-shop", { replace: true });
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };

    restoreRoom();

    return () => {
      cancelled = true;
    };
  }, [roomId, navigate]);

  // When a room is opened, reset the page to the top of the room view.
  // This prevents the browser from retaining the previous page scroll position.
  const scrollToRoomStart = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // Run once more after React mounts the room/chat UI, in case a child
    // component changes the scroll position during its initial render.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    });
  };

  const openRoom = (selectedRoomId) => {
    navigate(`/co-shop/${selectedRoomId}`);
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      setBusy(true);

      const { data } = await API.post("/co-shop", {
        name: roomName.trim(),
      });

      setRoom(data);
      navigate(`/co-shop/${data._id}`);
      scrollToRoomStart();
      setRoomName("");
      await loadRooms();
      toast.success("Co-Shop Room created!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create room"
      );
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setBusy(true);

      const { data } = await API.post("/co-shop/join", {
        inviteCode: inviteCode.trim(),
      });

      setRoom(data);
      navigate(`/co-shop/${data._id}`);
      scrollToRoomStart();
      setInviteCode("");
      await loadRooms();
      toast.success("You joined the room!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to join room"
      );
    } finally {
      setBusy(false);
    }
  };

  const addProduct = async (productId) => {
    try {
      setBusy(true);

      const { data } = await API.post(
        `/co-shop/${room._id}/items`,
        { productId }
      );

      setRoom(data);
      await loadRooms();
      toast.success("Product added to room");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not add product"
      );
    } finally {
      setBusy(false);
    }
  };

  const vote = async (itemId, value) => {
    try {
      const { data } = await API.put(
        `/co-shop/${room._id}/items/${itemId}/vote`,
        { value }
      );

      setRoom(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Vote failed");
    }
  };

  const removeProduct = async (itemId) => {
    try {
      const { data } = await API.delete(
        `/co-shop/${room._id}/items/${itemId}`
      );

      setRoom(data);
      toast.success("Product removed");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not remove product"
      );
    }
  };

  // SHARED CART: add product
  const addToSharedCart = async (productId) => {
    if (!room || room.status !== "active" || cartBusy) return;

    try {
      setCartBusy(true);

      const { data } = await API.post(
        `/co-shop/${room._id}/cart`,
        {
          productId,
          quantity: 1,
        }
      );

      setRoom(data);
      toast.success("Added to shared cart!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not add product to shared cart"
      );
    } finally {
      setCartBusy(false);
    }
  };

  // SHARED CART: update quantity
  const updateCartQuantity = async (cartItem, quantity) => {
    if (!room || room.status !== "active" || cartBusy) return;

    if (quantity < 1 || quantity > 99) return;

    try {
      setCartBusy(true);

      const { data } = await API.patch(
        `/co-shop/${room._id}/cart/${cartItem._id}`,
        { quantity }
      );

      setRoom(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not update cart quantity"
      );
    } finally {
      setCartBusy(false);
    }
  };

  // SHARED CART: remove item
  const removeFromSharedCart = async (cartItemId) => {
    if (!room || room.status !== "active" || cartBusy) return;

    try {
      setCartBusy(true);

      const { data } = await API.delete(
        `/co-shop/${room._id}/cart/${cartItemId}`
      );

      setRoom(data);
      toast.success("Removed from shared cart");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not remove cart item"
      );
    } finally {
      setCartBusy(false);
    }
  };

  // Calculate the shared cart total from current product prices.
  const sharedCartTotal = useMemo(() => {
    return (room?.sharedCart || []).reduce((total, item) => {
      const price = Number(item.product?.price || 0);
      return total + price * Number(item.quantity || 1);
    }, 0);
  }, [room?.sharedCart]);

  const sharedCartCount = useMemo(() => {
    return (room?.sharedCart || []).reduce(
      (total, item) => total + Number(item.quantity || 1),
      0
    );
  }, [room?.sharedCart]);

  const closeRoom = async () => {
    if (
      !window.confirm(
        "Close this room? Members will no longer be able to edit it."
      )
    ) {
      return;
    }

    try {
      setBusy(true);

      const { data } = await API.patch(
        `/co-shop/${room._id}/close`
      );

      setRoom(data);
      await loadRooms();
      toast.success("Room closed");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not close room"
      );
    } finally {
      setBusy(false);
    }
  };

  const copyInvite = async () => {
    const link = `${window.location.origin}/co-shop?invite=${room.inviteCode}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied!");
    } catch {
      toast.info(`Invite code: ${room.inviteCode}`);
    }
  };

  if (loading || (roomId && !room)) {
    return (
      <div className="py-20 text-center">
        Loading Co-Shop...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-indigo-100">
          SHOP TOGETHER
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Co-Shop Room 🛍️
        </h1>

        <p className="mt-3 max-w-2xl text-indigo-100">
          Create a room, invite your friends, compare products,
          vote together and build a shared shopping cart.
        </p>
      </header>

      {!room ? (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <form
              onSubmit={createRoom}
              className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="text-3xl">✨</div>

              <h2 className="text-xl font-bold">
                Create a Room
              </h2>

              <p className="text-sm text-gray-500">
                Start a group shopping session with your friends.
              </p>

              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Hostel Essentials"
                maxLength={80}
                required
                className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-indigo-500"
              />

              <button
                disabled={busy}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {busy ? "Please wait..." : "+ Create Room"}
              </button>
            </form>

            <form
              onSubmit={joinRoom}
              className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="text-3xl">🤝</div>

              <h2 className="text-xl font-bold">
                Join a Room
              </h2>

              <p className="text-sm text-gray-500">
                Have an invite code? Enter it to join your group.
              </p>

              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
                required
                className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-indigo-500"
              />

              <button
                disabled={busy}
                className="w-full rounded-xl border border-indigo-600 px-4 py-3 font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 disabled:opacity-60"
              >
                {busy ? "Please wait..." : "Join Room"}
              </button>
            </form>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">
              My Co-Shop Rooms
            </h2>

            {rooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
                <div className="text-4xl">🛒</div>

                <p className="mt-3 font-semibold">
                  No rooms yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Create a room or join your friends to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => openRoom(item._id)}
                    disabled={busy}
                    className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold">{item.name}</h3>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-500">
                      {item.members?.length || 0} members
                    </p>

                    <p className="mt-4 font-semibold text-indigo-600">
                      Open Room →
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="space-y-6">
          <button
            onClick={() => navigate("/co-shop")}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            ← Back to My Rooms
          </button>

          {/* ROOM HEADER */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {room.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Room owner: {room.owner?.name || "Customer"} ·{" "}
                  {room.members?.length || 0} members
                </p>

                <p className="mt-2 text-sm">
                  Invite code:{" "}
                  <span className="font-mono font-bold">
                    {room.inviteCode}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyInvite}
                  className="rounded-xl border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600"
                >
                  🔗 Copy Invite
                </button>

                {room.status === "active" &&
                  String(room.owner?._id) === String(userId) && (
                    <button
                      onClick={closeRoom}
                      disabled={busy}
                      className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      Close Room
                    </button>
                  )}
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Invite links work for customers who are logged in to this website.
            </p>
          </div>

          {room.status === "closed" && (
            <div className="rounded-xl bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              This room is closed. You can view its saved products,
              votes and shared cart, but you cannot edit them.
            </div>
          )}

          {/* GROUP PRODUCTS AND VOTES */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold">
              Group Products & Votes
            </h3>

            {room.items?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {room.items.map((item) => {
                  const product = item.product;

                  if (!product) return null;

                  const wantCount = item.votes.filter(
                    (v) => v.value === "want"
                  ).length;

                  const skipCount = item.votes.filter(
                    (v) => v.value === "skip"
                  ).length;

                  const myVote = item.votes.find(
                    (v) =>
                      String(v.user?._id || v.user) === String(userId)
                  )?.value;

                  const canRemove =
                    String(room.owner?._id) === String(userId) ||
                    String(item.addedBy?._id) === String(userId);

                  const alreadyInCart = (room.sharedCart || []).some(
                    (cartItem) =>
                      String(
                        cartItem.product?._id || cartItem.product
                      ) === String(product._id)
                  );

                  return (
                    <article
                      key={item._id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex h-44 items-center justify-center bg-gray-50 p-4 dark:bg-gray-800">
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/300"
                          }
                          alt={product.name}
                          className="h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="space-y-3 p-4">
                        <h4 className="font-bold">
                          {product.name}
                        </h4>

                        <p className="text-xl font-bold text-indigo-600">
                          {formatPrice(product.price)}
                        </p>

                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                            👍 Want: {wantCount}
                          </span>

                          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                            👎 Skip: {skipCount}
                          </span>
                        </div>

                        {room.status === "active" && (
                          <>
                            <div className="flex gap-2">
                              <button
                                onClick={() => vote(item._id, "want")}
                                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                                  myVote === "want"
                                    ? "border-green-600 bg-green-100 text-green-800"
                                    : "border-gray-300 dark:border-gray-700"
                                }`}
                              >
                                👍 Want
                              </button>

                              <button
                                onClick={() => vote(item._id, "skip")}
                                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                                  myVote === "skip"
                                    ? "border-red-600 bg-red-100 text-red-800"
                                    : "border-gray-300 dark:border-gray-700"
                                }`}
                              >
                                👎 Skip
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                addToSharedCart(product._id)
                              }
                              disabled={cartBusy}
                              className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {alreadyInCart
                                ? "🛒 Add One More"
                                : "🛒 Add to Shared Cart"}
                            </button>
                          </>
                        )}

                        {canRemove && room.status === "active" && (
                          <button
                            onClick={() => removeProduct(item._id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove product
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
                No products added yet. Choose one below!
              </p>
            )}
          </section>

          {/* ADD PRODUCTS TO THE ROOM */}
          {room.status === "active" && (
            <section className="space-y-4">
              <h3 className="text-2xl font-bold">
                Add Products
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products
                  .filter(
                    (product) =>
                      !room.items?.some(
                        (item) =>
                          String(
                            item.product?._id || item.product
                          ) === String(product._id)
                      )
                  )
                  .map((product) => {
                    const alreadyInCart = (
                      room.sharedCart || []
                    ).some(
                      (item) =>
                        String(
                          item.product?._id || item.product
                        ) === String(product._id)
                    );

                    return (
                      <article
                        key={product._id}
                        className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                      >
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/300"
                          }
                          alt={product.name}
                          className="mb-3 h-28 w-full object-contain"
                        />

                        <h4 className="line-clamp-2 font-semibold">
                          {product.name}
                        </h4>

                        <p className="mt-1 font-bold text-indigo-600">
                          {formatPrice(product.price)}
                        </p>

                        <button
                          disabled={busy}
                          onClick={() => addProduct(product._id)}
                          className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          + Add to Room
                        </button>

                        <button
                          disabled={cartBusy}
                          onClick={() =>
                            addToSharedCart(product._id)
                          }
                          className="mt-2 w-full rounded-lg border border-indigo-600 px-3 py-2 text-sm font-semibold text-indigo-600 disabled:opacity-50"
                        >
                          {alreadyInCart
                            ? "🛒 Add One More"
                            : "🛒 Add to Shared Cart"}
                        </button>
                      </article>
                    );
                  })}
              </div>
            </section>
          )}

          {/* SHARED CART */}
          <section
            id="shared-cart"
            className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  SHOP TOGETHER
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  🛒 Shared Cart
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {sharedCartCount} item
                  {sharedCartCount === 1 ? "" : "s"} · Shared with all room members
                </p>
              </div>

              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
                {formatPrice(sharedCartTotal)}
              </span>
            </div>

            {!room.sharedCart?.length ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <div className="text-4xl">🛍️</div>

                <p className="mt-3 font-semibold">
                  Your shared cart is empty
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add products from the sections above to start your group cart.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {room.sharedCart.map((item) => {
                    const product = item.product;

                    if (!product) {
                      return (
                        <div
                          key={item._id}
                          className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
                        >
                          A product in this cart is no longer available.
                          Please remove it after reopening the cart item.
                        </div>
                      );
                    }

                    const quantity = Number(item.quantity || 1);
                    const subtotal =
                      Number(product.price || 0) * quantity;

                    return (
                      <article
                        key={item._id}
                        className="flex flex-col gap-4 rounded-xl border border-gray-200 p-3 dark:border-gray-700 sm:flex-row sm:items-center"
                      >
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
                          <img
                            src={
                              product.image ||
                              "https://via.placeholder.com/200"
                            }
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold">
                            {product.name}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatPrice(product.price)} each
                          </p>

                          <p className="mt-1 text-sm font-bold text-indigo-600">
                            Subtotal: {formatPrice(subtotal)}
                          </p>

                          {item.addedBy?.name && (
                            <p className="mt-1 text-xs text-gray-500">
                              Added by {item.addedBy.name}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {room.status === "active" && (
                            <div className="flex items-center gap-2 rounded-lg border border-gray-300 p-1 dark:border-gray-700">
                              <button
                                aria-label="Decrease quantity"
                                disabled={cartBusy || quantity <= 1}
                                onClick={() =>
                                  updateCartQuantity(
                                    item,
                                    quantity - 1
                                  )
                                }
                                className="h-8 w-8 rounded-md font-bold hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
                              >
                                −
                              </button>

                              <span className="min-w-6 text-center font-semibold">
                                {quantity}
                              </span>

                              <button
                                aria-label="Increase quantity"
                                disabled={cartBusy || quantity >= 99}
                                onClick={() =>
                                  updateCartQuantity(
                                    item,
                                    quantity + 1
                                  )
                                }
                                className="h-8 w-8 rounded-md font-bold hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
                              >
                                +
                              </button>
                            </div>
                          )}

                          {room.status === "active" && (
                            <button
                              disabled={cartBusy}
                              onClick={() =>
                                removeFromSharedCart(item._id)
                              }
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">
                      Total items
                    </span>

                    <span className="font-semibold">
                      {sharedCartCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold">
                      Estimated total
                    </span>

                    <span className="text-xl font-bold text-indigo-600">
                      {formatPrice(sharedCartTotal)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    This estimate excludes shipping, discounts and taxes
                    that may be calculated during checkout.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    room.status !== "active" ||
                    !room.sharedCart?.length ||
                    cartBusy
                  }
                  onClick={() =>
                    navigate(`/checkout?coShopRoom=${encodeURIComponent(room._id)}`)
                  }
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed to Checkout →
                </button>

                <p className="text-center text-xs text-gray-500">
                  Checkout uses this room’s shared cart and keeps your personal
                  cart separate. Only proceed when the room is active.
                </p>
              </>
            )}
          </section>

          {/* REAL-TIME GROUP CHAT */}
          <CoShopChat
            room={room}
            user={user}
            onRoomUpdated={setRoom}
          />
        </section>
      )}
    </div>
  );
};

export default CoShop;