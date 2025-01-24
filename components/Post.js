import React, { useState, useEffect } from "react";
import {
  BookmarkIcon,
  ChatBubbleOvalLeftIcon as ChatIcon,
  EllipsisHorizontalIcon as DotsHorizontalIcon,
  FaceSmileIcon as EmojiHappyIcon,
  HeartIcon,
  PaperAirplaneIcon,
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

function Post({
  id,
  username,
  userImg,
  img,
  images,
  caption,
  location,
  hashtags,
  taggedUsers,
}) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Yorumları dinle
  useEffect(() => {
    if (!id) return;

    return onSnapshot(
      query(
        collection(db, "posts", id, "comments"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => setComments(snapshot.docs)
    );
  }, [db, id]);

  // Beğenileri dinle
  useEffect(() => {
    if (!id) return;

    return onSnapshot(collection(db, "posts", id, "likes"), (snapshot) =>
      setLikes(snapshot.docs)
    );
  }, [db, id]);

  // Kullanıcının beğenip beğenmediğini kontrol et
  useEffect(() => {
    setHasLiked(
      likes.findIndex((like) => like.id === session?.user?.email) !== -1
    );
  }, [likes, session]);

  // Resimleri önceden yükle
  useEffect(() => {
    if (images && images.length > 1) {
      images.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [images]);

  const likePost = async () => {
    if (!session) return;

    try {
      if (hasLiked) {
        await deleteDoc(doc(db, "posts", id, "likes", session.user.email));
      } else {
        await setDoc(doc(db, "posts", id, "likes", session.user.email), {
          username: session.user.name || session.user.username,
          userEmail: session.user.email,
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error in likePost:", error);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();

    const commentToSend = comment;
    setComment("");

    await addDoc(collection(db, "posts", id, "comments"), {
      comment: commentToSend,
      username: session.user.username,
      userImage: session.user.image,
      timestamp: serverTimestamp(),
    });
  };

  // Resim geçiş fonksiyonlarını optimize et
  const nextImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  return (
    <div className="bg-white my-7 border rounded-sm">
      {/* Header */}
      <div className="flex items-center p-5">
        <img
          className="rounded-full h-12 w-12 object-contain border p-1 mr-3"
          src={userImg}
          alt={username}
        />
        <div className="flex-1">
          <p className="font-bold">{username}</p>
          {location && <p className="text-xs text-gray-500">{location}</p>}
        </div>
        <DotsHorizontalIcon className="h-5" />
      </div>

      {/* Images - Optimize edildi */}
      <div className="relative bg-black">
        <div className="flex items-center justify-center">
          <img
            src={images ? images[currentImageIndex] : img}
            className="max-w-full w-auto max-h-[600px] object-contain"
            alt=""
            loading="eager"
          />
        </div>

        {/* Çoklu resim navigasyonu */}
        {images && images.length > 1 && (
          <>
            {/* Gezinme noktaları */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all
                    ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                />
              ))}
            </div>

            {/* İleri/geri butonları */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 
                bg-black/50 text-white rounded-full p-2 hover:bg-black/75 z-10"
              onClick={prevImage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 
                bg-black/50 text-white rounded-full p-2 hover:bg-black/75 z-10"
              onClick={nextImage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
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

      {/* Buttons */}
      {session && (
        <div className="flex justify-between px-4 pt-4">
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
            <PaperAirplaneIcon className="btn rotate-45" />
          </div>
          <BookmarkIcon className="btn" />
        </div>
      )}

      {/* Caption ve Hashtags */}
      <div className="p-5">
        {likes.length > 0 && (
          <p className="font-bold mb-1">{likes.length} likes</p>
        )}
        <p className="truncate">
          <span className="font-bold mr-1">{username}</span>
          {caption}
        </p>
        {hashtags && hashtags.length > 0 && (
          <p className="text-blue-500 text-sm mt-1">{hashtags.join(" ")}</p>
        )}
        {taggedUsers && taggedUsers.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            with {taggedUsers.join(", ")}
          </p>
        )}
      </div>

      {/* Comments */}
      {comments.length > 0 && (
        <div className="ml-10 h-20 overflow-y-scroll scrollbar-thumb-black scrollbar-thin">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-center space-x-2 mb-3">
              <img
                className="h-7 rounded-full"
                src={comment.data().userImage}
                alt=""
              />
              <p className="text-sm flex-1">
                <span className="font-bold">{comment.data().username}</span>{" "}
                {comment.data().comment}
              </p>
              <Moment fromNow className="pr-5 text-xs">
                {comment.data().timestamp?.toDate()}
              </Moment>
            </div>
          ))}
        </div>
      )}

      {/* Input box */}
      {session && (
        <form className="flex items-center p-4">
          <EmojiHappyIcon className="h-7" />
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="border-none flex-1 focus:ring-0 outline-none"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            onClick={sendComment}
            className="font-semibold text-blue-400"
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
}

export default Post;
