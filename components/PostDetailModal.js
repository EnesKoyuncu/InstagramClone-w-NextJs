import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  HeartIcon,
  ChatBubbleLeftIcon as ChatIcon,
  BookmarkIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Moment from "react-moment";
import EmojiPicker from "emoji-picker-react";

function PostDetailModal({ isOpen, setIsOpen, post }) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const commentInputRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Yorumları dinle
  useEffect(() => {
    if (post) {
      const unsubscribe = onSnapshot(
        query(
          collection(db, "posts", post.id, "comments"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => {
          setComments(snapshot.docs);
        }
      );
      return unsubscribe;
    }
  }, [post]);

  // Beğenileri dinle
  useEffect(() => {
    if (post) {
      const unsubscribe = onSnapshot(
        collection(db, "posts", post.id, "likes"),
        (snapshot) => {
          setLikes(snapshot.docs);
        }
      );
      return unsubscribe;
    }
  }, [post]);

  // Kullanıcının beğenip beğenmediğini kontrol et
  useEffect(() => {
    setHasLiked(
      likes.findIndex((like) => like.id === session?.user?.email) !== -1
    );
  }, [likes, session]);

  // Beğeni ekle/kaldır
  const likePost = async () => {
    if (!session) return;

    if (hasLiked) {
      await deleteDoc(doc(db, "posts", post.id, "likes", session.user.email));
    } else {
      await setDoc(doc(db, "posts", post.id, "likes", session.user.email), {
        username: session.user.name,
      });
    }
  };

  // Yorum gönder
  const sendComment = async (e) => {
    e.preventDefault();

    const commentToSend = comment;
    setComment("");

    await addDoc(collection(db, "posts", post.id, "comments"), {
      comment: commentToSend,
      username: session.user.username || session.user.name,
      userImage: session.user.image,
      timestamp: serverTimestamp(),
    });
  };

  // Emoji seçildiğinde
  const onEmojiClick = (emojiObject) => {
    const comment = commentInputRef.current.value;
    const cursorPosition = commentInputRef.current.selectionStart;
    const text =
      comment.slice(0, cursorPosition) +
      emojiObject.emoji +
      comment.slice(cursorPosition);
    setComment(text);

    // Cursor'ı emoji sonrasına taşı
    setTimeout(() => {
      commentInputRef.current.selectionStart =
        cursorPosition + emojiObject.emoji.length;
      commentInputRef.current.selectionEnd =
        cursorPosition + emojiObject.emoji.length;
    }, 0);
  };

  // Modal dışına tıklandığında emoji picker'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojis && !event.target.closest(".emoji-picker-container")) {
        setShowEmojis(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojis]);

  // Resimleri önceden yükle
  useEffect(() => {
    if (post?.images && post.images.length > 1) {
      post.images.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [post?.images]);

  // Resim geçiş fonksiyonları
  const nextImage = () => {
    if (post?.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const prevImage = () => {
    if (post?.images && post.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + post.images.length) % post.images.length
      );
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-50 inset-0 overflow-y-auto"
        onClose={setIsOpen}
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-xl overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="flex h-[90vh] max-h-[90vh]">
                {/* Sol taraf - Resim */}
                <div className="flex-grow w-[60%] bg-black flex items-center relative">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={
                        post?.images
                          ? post.images[currentImageIndex]
                          : post?.image
                      }
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      alt={post?.caption}
                    />

                    {/* Çoklu resim navigasyonu */}
                    {post?.images && post.images.length > 1 && (
                      <>
                        {/* Gezinme noktaları */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                          {post.images.map((_, index) => (
                            <div
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full cursor-pointer transition-all
                                ${
                                  index === currentImageIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                }`}
                            />
                          ))}
                        </div>

                        {/* İleri/geri butonları */}
                        <button
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 
                            bg-black/50 text-white rounded-full p-2 hover:bg-black/75 z-10"
                          onClick={prevImage}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                          </svg>
                        </button>
                        <button
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 
                            bg-black/50 text-white rounded-full p-2 hover:bg-black/75 z-10"
                          onClick={nextImage}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sağ taraf - Detaylar */}
                <div className="w-[40%] flex flex-col h-full">
                  {/* Üst kısım - Kullanıcı bilgisi */}
                  <div className="flex items-center p-3 border-b">
                    <img
                      src={post?.profileImg}
                      alt={post?.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <p className="font-semibold ml-2">{post?.username}</p>
                  </div>

                  {/* Orta kısım - Caption ve yorumlar */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Caption */}
                    <div className="p-3 border-b">
                      <div className="flex items-center space-x-2">
                        <img
                          src={post?.profileImg}
                          alt={post?.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <p>
                          <span className="font-semibold mr-2">
                            {post?.username}
                          </span>
                          {post?.caption}
                        </p>
                      </div>
                    </div>

                    {/* Yorumlar */}
                    <div className="p-3">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start space-x-2 mb-3"
                        >
                          <img
                            src={comment.data().userImage}
                            alt={comment.data().username}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p>
                              <span className="font-semibold mr-2">
                                {comment.data().username}
                              </span>
                              {comment.data().comment}
                            </p>
                            <p className="text-xs text-gray-500">
                              <Moment fromNow>
                                {comment.data().timestamp?.toDate()}
                              </Moment>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alt kısım - Etkileşim butonları ve yorum alanı */}
                  <div className="border-t">
                    {/* Butonlar */}
                    <div className="flex justify-between p-3">
                      <div className="flex space-x-4">
                        {hasLiked ? (
                          <HeartIconFilled
                            onClick={likePost}
                            className="btn text-red-500"
                          />
                        ) : (
                          <HeartIcon onClick={likePost} className="btn" />
                        )}
                        <ChatIcon className="btn" />
                      </div>
                      <BookmarkIcon className="btn" />
                    </div>

                    {/* Beğeni sayısı ve zaman bilgisi yan yana */}
                    <div className="px-3 pb-3 flex items-center justify-between">
                      <p className="font-bold text-sm">
                        {likes.length > 0 && `${likes.length} likes`}
                      </p>
                      <p className="text-xs text-gray-500">
                        <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
                      </p>
                    </div>

                    {/* Yorum input alanı */}
                    <form className="flex items-center p-3 border-t relative">
                      <div className="relative">
                        <FaceSmileIcon
                          className="h-7 mr-2 cursor-pointer hover:opacity-50"
                          onClick={() => setShowEmojis(!showEmojis)}
                        />
                        {showEmojis && (
                          <div className="absolute bottom-10 -left-2 z-40 emoji-picker-container">
                            <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              searchDisabled
                              skinTonesDisabled
                              width={300}
                              height={400}
                              previewConfig={{
                                showPreview: false,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        ref={commentInputRef}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="border-none flex-1 focus:ring-0 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        onClick={sendComment}
                        className="font-semibold text-blue-400 disabled:text-blue-200"
                      >
                        Post
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default PostDetailModal;
