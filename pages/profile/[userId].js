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

      // Kullanıcının gönderilerini getir - email ile eşleştirme yapıyoruz
      const fetchUserPosts = async () => {
        try {
          console.log("Fetching posts for user:", userId);
          const q = query(
            collection(db, "posts"),
            where("email", "==", userId) // username yerine email ile sorgulama
          );
          const querySnapshot = await getDocs(q);
          console.log("Found posts:", querySnapshot.docs.length);

          const posts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("Processed posts:", posts);
          setUserPosts(posts);
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

          {/* Posts Grid - Daha küçük ve aşağıda */}
          <div className="grid grid-cols-3 gap-1 mt-16 mx-4 mb-8">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square group cursor-pointer max-w-[300px]"
                onClick={() => {
                  setSelectedPost(post);
                  setIsPostModalOpen(true);
                }}
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  className="object-cover w-full h-full rounded-sm"
                />
                {/* Hover overlay - güncellendi */}
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
