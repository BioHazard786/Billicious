import React from "react";
import { BackgroundImageUploader } from "../ui/image-upload";
import ResponsiveHeader from "../ui/responsive-header";

const GroupImageTab: React.FC = () => {
  return (
    <>
      <ResponsiveHeader
        isDesktop={true}
        title="Add Image"
        description="Choose group cover image"
      />
      <ResponsiveHeader
        isDesktop={false}
        title="Add Image"
        description="Choose group cover image"
      />
      <div className="px-4 md:px-0">
        <BackgroundImageUploader
          accept={{ "image/jpeg": [], "image/png": [] }}
        />
      </div>
    </>
  );
};

export default GroupImageTab;
