import { cn } from "@/lib/utils";
import React from "react";
import { DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "./drawer";

const ResponsiveHeader = ({
  isDesktop,
  title,
  description,
}: {
  isDesktop: boolean;
  title: string;
  description: string;
}) => {
  const HeaderComponent = isDesktop ? DialogHeader : DrawerHeader;
  const TitleComponent = isDesktop ? DialogTitle : DrawerTitle;
  const DescriptionComponent = isDesktop
    ? DialogDescription
    : DrawerDescription;

  return (
    <HeaderComponent
      className={cn("pb-4", isDesktop ? "hidden md:block" : "md:hidden")}
    >
      <TitleComponent>{title}</TitleComponent>
      <DescriptionComponent>{description}</DescriptionComponent>
    </HeaderComponent>
  );
};

export default ResponsiveHeader;
