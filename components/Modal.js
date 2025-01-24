import { useRecoilState } from "recoil";
import { modalState } from "../atoms/modalAtom";
import { Dialog, Transition } from "@headlessui/react";
import {
  CameraIcon,
  MapPinIcon,
  TagIcon,
  UserPlusIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useRef, useState } from "react";
import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "@firebase/firestore";
import { useSession } from "next-auth/react";
import { ref, getDownloadURL, uploadBytes } from "@firebase/storage";

function Modal() {
  const { data: session } = useSession();
  const [open, setOpen] = useRecoilState(modalState);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const filePickerRef = useRef(null);

  const addImages = (e) => {
    const files = Array.from(e.target.files);

    // Reset states if new files are selected
    setSelectedFiles(files);
    setPreviewUrls([]);
    setCurrentPreviewIndex(0);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPost = async () => {
    if (loading || selectedFiles.length === 0) return;
    setLoading(true);

    try {
      // 1. Create post document first
      const docRef = await addDoc(collection(db, "posts"), {
        username: session.user.username || session.user.name,
        email: session.user.email,
        profileImg: session.user.image,
        caption: caption,
        location: location,
        hashtags: hashtags.split(" ").filter((tag) => tag.startsWith("#")),
        taggedUsers: taggedUsers,
        timestamp: serverTimestamp(),
      });

      // 2. Upload all images
      const imageUrls = await Promise.all(
        selectedFiles.map(async (file, index) => {
          const imageRef = ref(storage, `posts/${docRef.id}/${index}`);
          await uploadBytes(imageRef, file);
          return getDownloadURL(imageRef);
        })
      );

      // 3. Update post with image URLs
      await updateDoc(doc(db, "posts", docRef.id), {
        images: imageUrls,
      });

      console.log("Post uploaded successfully!");
      resetStates();
    } catch (error) {
      console.error("Error uploading post:", error);
    }

    setOpen(false);
    setLoading(false);
  };

  const resetStates = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setCurrentPreviewIndex(0);
    setCaption("");
    setLocation("");
    setHashtags("");
    setTaggedUsers([]);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => {
          setOpen(false);
          resetStates();
        }}
      >
        <div className="flex items-end justify-center min-h-[800px] sm:min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                {previewUrls.length > 0 ? (
                  <div className="relative">
                    <img
                      src={previewUrls[currentPreviewIndex]}
                      className="w-full object-contain cursor-pointer max-h-[400px]"
                      alt=""
                    />

                    {/* Preview Navigation */}
                    {previewUrls.length > 1 && (
                      <>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                          {previewUrls.map((_, index) => (
                            <div
                              key={index}
                              onClick={() => setCurrentPreviewIndex(index)}
                              className={`w-2 h-2 rounded-full cursor-pointer
                                ${
                                  index === currentPreviewIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                }`}
                            />
                          ))}
                        </div>

                        <button
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                          onClick={() =>
                            setCurrentPreviewIndex((prev) =>
                              prev === 0 ? previewUrls.length - 1 : prev - 1
                            )
                          }
                        >
                          <ArrowLeftIcon className="h-5 w-5" />
                        </button>

                        <button
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                          onClick={() =>
                            setCurrentPreviewIndex((prev) =>
                              prev === previewUrls.length - 1 ? 0 : prev + 1
                            )
                          }
                        >
                          <ArrowRightIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => filePickerRef.current.click()}
                    className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 cursor-pointer"
                  >
                    <CameraIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Upload Photos
                    </Dialog.Title>

                    <div>
                      <input
                        ref={filePickerRef}
                        type="file"
                        multiple
                        hidden
                        accept="image/*"
                        onChange={addImages}
                      />
                    </div>

                    <div className="mt-2">
                      <textarea
                        className="border-none focus:ring-0 w-full text-center"
                        placeholder="Please enter a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                      />
                    </div>

                    <div className="mt-2 flex items-center border rounded-md">
                      <MapPinIcon className="h-5 w-5 ml-2 text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Add location..."
                        className="border-none focus:ring-0 w-full"
                      />
                    </div>

                    <div className="mt-2 flex items-center border rounded-md">
                      <TagIcon className="h-5 w-5 ml-2 text-gray-400" />
                      <input
                        type="text"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        placeholder="Add hashtags... (space separated)"
                        className="border-none focus:ring-0 w-full"
                      />
                    </div>

                    {/* Tagged Users */}
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {taggedUsers.map((user, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center"
                          >
                            {user}
                            <XMarkIcon
                              className="h-4 w-4 ml-1 cursor-pointer"
                              onClick={() =>
                                setTaggedUsers((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    disabled={!selectedFiles.length || loading}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:disabled:bg-gray-300"
                    onClick={uploadPost}
                  >
                    {loading ? "Uploading..." : "Upload Post"}
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default Modal;
