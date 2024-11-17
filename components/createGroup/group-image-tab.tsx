import React from "react";
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
    </>
  );
};

export default GroupImageTab;
