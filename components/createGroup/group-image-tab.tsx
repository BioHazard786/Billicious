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
      <BackgroundImageUploader accept={{ "image/jpeg": [], "image/png": [] }} />
    </>
  );
};

export default GroupImageTab;
