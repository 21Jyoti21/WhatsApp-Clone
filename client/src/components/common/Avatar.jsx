import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const finalImage =
  image && image.trim() !== ""
    ? image
    : "/default_avatar.png";
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)
  const [showCapturePhoto, setShowCapturePhoto] = useState(false)
  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
  };
  useEffect(() => {
    if (grabPhoto) {
      const input = document.getElementById("photo-picker");
      if (input) {
        input.click();
      }
    }
  }, [grabPhoto]);

  const contextMenuOptions = [
    { name: "Take Photo", callback: () => {
      setShowCapturePhoto(true)
    } },
    { name: "Choose From Library", callback: () => {
      setShowPhotoLibrary(true)
    } },
    {
      name: "Upload Photo",
      callback: () => {
        setGrabPhoto(true);
      },
    },
    {
      name: "Remove Photo",
      callback: () => {
        setImage("/default_avatar.png");
      },
    },
  ];
  const photoPickerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setImage(event.target.result);
      setGrabPhoto(false);
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {type === "sm" && (
          <div className="relative h-10 w-10">
            <Image src={finalImage} alt="avatar" className="rounded-full" fill sizes="40px" />
          </div>
        )}
        {type === "lg" && (
          <div className="relative h-14 w-14">
            <Image src={finalImage} alt="avatar" className="rounded-full" fill sizes="56px" />
          </div>
        )}
        {type === "xl" && (
          <div
            className="relative cursor-pointer z-0"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2 
            ${hover ? "visible" : "hidden"}`}
              onClick={(e) => showContextMenu(e)}
            >
              <FaCamera
                className="text-2xl"
                id="context-opener"
                onClick={(e) => showContextMenu(e)}
              ></FaCamera>
              <span onClick={(e) => showContextMenu(e)}>
                Change Profile Photo
              </span>
            </div>
            <div className="flex items-center justify-center h-60 w-60">
              <Image src={finalImage} alt="avatar" className="rounded-full" fill sizes="240px" />
            </div>
          </div>
        )}
      </div>
      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          cordinates={contextMenuCordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}
      {
        showCapturePhoto && <CapturePhoto
          setImage={setImage}
          hide={setShowCapturePhoto}
        />
      }
      {showPhotoLibrary && <PhotoLibrary setImage={setImage} hidePhotoLibrary={setShowPhotoLibrary}/>}
      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
    </>
  );
}
export default Avatar;