import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "../../components/Header";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import ProfileEditModal from "../../components/ProfileEditModal";
import {
  HeartIcon,
  ChatBubbleLeftIcon as ChatIcon,
} from "@heroicons/react/24/outline";
import PostDetailModal from "../../components/PostDetailModal";

export default function ProfilePage() {
  const router = useRouter();
  const { userId } = router.query;
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postStats, setPostStats] = useState({});

  useEffect(() => {
    if (userId) {
      // Kullanıcı profilini getir
      const fetchProfile = async () => {
        try {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else if (session?.user?.email === userId) {
            // Yeni kullanıcı için profil oluştur
            const newProfile = {
              username: session.user.name,
              email: session.user.email,
              profileImage: session.user.image,
              bio: "",
              followers: [],
              following: [],
              timestamp: serverTimestamp(),
            };

            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating profile:", error);
        }
      };

      // Kullanıcının gönderilerini getir
      const fetchUserPosts = async () => {
        try {
          console.log("Fetching posts for user:", userId);
          const q = query(
            collection(db, "posts"),
            where("email", "==", userId),
            orderBy("timestamp", "desc")
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const posts = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              // Geriye uyumluluk için
              image: doc.data().images
                ? doc.data().images[0]
                : doc.data().image,
            }));
            setUserPosts(posts);
          });

          return () => unsubscribe();
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };

      fetchProfile();
      fetchUserPosts();
    }
  }, [userId, session]);

  // Post istatistiklerini dinle
  useEffect(() => {
    if (userPosts.length > 0) {
      const unsubscribes = userPosts.map((post) => {
        // Beğenileri dinle
        const likesUnsubscribe = onSnapshot(
          collection(db, "posts", post.id, "likes"),
          (snapshot) => {
            setPostStats((prev) => ({
              ...prev,
              [post.id]: {
                ...prev[post.id],
                likes: snapshot.docs.length,
              },
            }));
          }
        );

        // Yorumları dinle
        const commentsUnsubscribe = onSnapshot(
          collection(db, "posts", post.id, "comments"),
          (snapshot) => {
            setPostStats((prev) => ({
              ...prev,
              [post.id]: {
                ...prev[post.id],
                comments: snapshot.docs.length,
              },
            }));
          }
        );

        return () => {
          likesUnsubscribe();
          commentsUnsubscribe();
        };
      });

      return () => {
        unsubscribes.forEach((unsub) => unsub());
      };
    }
  }, [userPosts]);

  const handleProfileUpdate = (updates) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  if (!userId) return null;

  return (
    <div>
      <Header />
      <main className="bg-gray-100 bg-opacity-25">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-center justify-between mt-8 mx-4 sm:mx-0">
            <div className="flex items-center space-x-8">
              {/* Profile Image */}
              <img
                src={userProfile?.profileImage || session?.user?.image}
                alt="profile"
                className="rounded-full w-32 h-32 object-cover border p-1"
              />

              {/* Profile Info */}
              <div>
                <h1 className="text-2xl font-bold">
                  {userProfile?.username || session?.user?.name}
                </h1>
                <p className="text-sm text-gray-500 whitespace-pre-wrap">
                  {userProfile?.bio || "No bio yet"}
                </p>
                <div className="flex space-x-6 mt-4">
                  <p>
                    <span className="font-semibold">{userPosts.length}</span>{" "}
                    posts
                  </p>
                  <p>
                    <span className="font-semibold">
                      {userProfile?.followers?.length || 0}
                    </span>{" "}
                    followers
                  </p>
                  <p>
                    <span className="font-semibold">
                      {userProfile?.following?.length || 0}
                    </span>{" "}
                    following
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Profile Button (Only show for own profile) */}
            {session?.user?.email === userId && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-3 gap-1 mt-16 mx-4 mb-8">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square group cursor-pointer bg-black"
                onClick={() => {
                  setSelectedPost(post);
                  setIsPostModalOpen(true);
                }}
              >
                {/* Çoklu resim göstergesi */}
                {post.images && post.images.length > 1 && (
                  <div className="absolute top-2 right-2 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="white"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
                      />
                    </svg>
                  </div>
                )}

                {/* Post resmi */}
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={post.images ? post.images[0] : post.image}
                    alt={post.caption}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center space-x-8">
                  <div className="hidden group-hover:flex items-center text-white">
                    <HeartIcon className="h-8 w-8" />
                    <span className="ml-2 text-lg font-semibold">
                      {postStats[post.id]?.likes || 0}
                    </span>
                  </div>
                  <div className="hidden group-hover:flex items-center text-white">
                    <ChatIcon className="h-8 w-8" />
                    <span className="ml-2 text-lg font-semibold">
                      {postStats[post.id]?.comments || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Profile Edit Modal */}
      {isEditing && (
        <ProfileEditModal
          isOpen={isEditing}
          setIsOpen={setIsEditing}
          profile={userProfile}
          userId={userId}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          isOpen={isPostModalOpen}
          setIsOpen={setIsPostModalOpen}
          post={selectedPost}
        />
      )}
    </div>
  );
}
