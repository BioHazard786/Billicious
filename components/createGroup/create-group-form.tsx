import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { createClient } from "@/auth-utils/client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { resetGroupFormStores, titleCase } from "@/lib/utils";
import { createGroupInDB } from "@/server/fetchHelpers";
import useCreateGroupFormStore from "@/store/create-group-form-store";
import useCreateGroup from "@/store/create-group-store";
import useGroupImageTabStore from "@/store/group-image-tab-store";
import useGroupNameTabStore from "@/store/group-name-tab-store";
import useUserStore from "@/store/user-info-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AnimatedButton from "../ui/animated-button";
import { CustomBreadcrumb } from "../ui/breadcrumb";
import AddMemberTab from "./add-member-tab";
import GroupImageTab from "./group-image-tab";
import GroupNameTab from "./group-name-tab";

const tabs = [
  {
    id: 0,
    label: "GroupName",
    content: <GroupNameTab />,
  },
  {
    id: 1,
    label: "GroupImage",
    content: <GroupImageTab />,
  },
  {
    id: 2,
    label: "AddMember",
    content: <AddMemberTab />,
  },
];

const variants = {
  initial: (direction: number) => ({
    x: 300 * direction,
    opacity: 0,
    // filter: "blur(4px)",
  }),
  active: {
    x: 0,
    opacity: 1,
    // filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: -300 * direction,
    opacity: 0,
    // filter: "blur(4px)",
  }),
};

const CreateGroupForm = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const activeTab = useCreateGroupFormStore.use.activeTab();
  const direction = useCreateGroupFormStore.use.direction();
  const isAnimating = useCreateGroupFormStore.use.isAnimating();
  const setActiveTab = useCreateGroupFormStore.use.setActiveTab();
  const setDirection = useCreateGroupFormStore.use.setDirection();
  const setIsAnimating = useCreateGroupFormStore.use.setIsAnimating();

  const groupName = useGroupNameTabStore.use.groupName();
  const currencyCode = useGroupNameTabStore.use.currency();
  const groupImage = useGroupImageTabStore.use.files();
  const temporaryMembers = useCreateGroup.use.temporaryMemberNames();
  const permanentMembers = useCreateGroup.use.permanentMembers();

  const admin = useUserStore((state) => state.user);

  const router = useRouter();

  const content = useMemo(() => tabs[activeTab]?.content || null, [activeTab]);

  const handleTabClick = useCallback(
    (newTabId: number) => {
      if (groupName.length === 0) {
        return toast.error("Enter group name first");
      }

      if (newTabId !== activeTab && !isAnimating) {
        setDirection(newTabId > activeTab ? 1 : -1);
        setActiveTab(newTabId);
      }
    },
    [activeTab, isAnimating, setDirection, setActiveTab, groupName],
  );

  const uploadGroupImage = async ({
    groupId,
    image,
  }: {
    groupId: string;
    image: File;
  }) => {
    const { error } = await supabase.storage
      .from("group_cover_image")
      .upload(`${groupId}/${image.name}`, image, { upsert: true });

    if (error) throw error;
    const { data: imageData } = supabase.storage
      .from("group_cover_image")
      .getPublicUrl(`${groupId}/${image.name}`);

    return imageData.publicUrl;
  };

  const { isPending: imageUploadPending, mutateAsync: handleUploadGroupImage } =
    useMutation({
      mutationFn: uploadGroupImage,
      onMutate: (variables) => {
        const toastId = toast.loading("Uploading group cover image...");
        return { toastId };
      },
      onSuccess: (data, variables, context) => {
        return toast.success("Group cover image uploaded successfully", {
          id: context.toastId,
        });
      },
      onError: (error, _, context) => {
        console.error(error);
        return toast.error(
          `Failed to upload group cover image: ${error.message}`,
          {
            id: context?.toastId,
          },
        );
      },
      onSettled: (data, error, variables, context) => {
        toastIdRef.current = context?.toastId;
      },
    });

  const { isPending, mutate: server_createGroup } = useMutation({
    mutationFn: createGroupInDB,
    onMutate: (variables) => {
      if (toastIdRef.current) {
        toast.loading(`Creating ${variables.name} group...`, {
          id: toastIdRef.current,
        });
        return { toastId: toastIdRef.current };
      } else {
        const toastId = toast.loading(`Creating ${variables.name} group...`);
        return { toastId };
      }
    },
    onSuccess: (data: { group: { id: string } }, variables, context) => {
      queryClient.refetchQueries({
        queryKey: ["homepage", admin!.id],
        exact: true,
      });
      router.replace(`/group/${encodeURIComponent(data.group.id)}`);
      resetGroupFormStores();
      return toast.success(`${variables.name} group created successfully`, {
        id: context.toastId,
      });
    },
    onError: (error, _, context) => {
      console.log(error);
      return toast.error(error.message, { id: context?.toastId });
    },
    onSettled: () => {
      setIsOpen(false);
      toastIdRef.current = undefined;
    },
  });

  const createGroup = async () => {
    if (temporaryMembers.length === 0 && permanentMembers.length === 0) {
      return toast.error("Add atleast one member temporary or permanent");
    }

    let backgroundUrl = undefined;

    if (groupImage.length > 0) {
      backgroundUrl = await handleUploadGroupImage({
        groupId: nanoid(),
        image: groupImage[0],
      });
    }

    server_createGroup({
      name: titleCase(groupName),
      members: temporaryMembers,
      usernames: permanentMembers.map((member) => member.username),
      ownerId: admin!.id,
      currencyCode: currencyCode,
      backgroundUrl: backgroundUrl,
    });
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="z-[101] max-w-[30rem]">
          <div className="relative h-full w-full overflow-hidden">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
              onExitComplete={() => setIsAnimating(false)}
            >
              <motion.div
                key={activeTab}
                variants={variants}
                initial="initial"
                animate="active"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                custom={direction}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
          <DialogFooter className="flex-row items-center sm:justify-between">
            <CustomBreadcrumb
              handleTabClick={handleTabClick}
              tabs={tabs}
              activeTab={activeTab}
            />
            <AnimatedButton
              type="submit"
              variant="default"
              onClick={() => {
                if (activeTab + 1 < tabs.length) {
                  handleTabClick(activeTab + 1);
                } else {
                  createGroup();
                }
              }}
              isDisabled={isPending || groupName.length === 0}
              isLoading={isPending}
            >
              {activeTab + 1 === tabs.length ? "Create" : "Next"}
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="z-[101] placeholder:sm:max-w-[425px]">
        <DrawerHeader className="justify-center pb-0">
          <CustomBreadcrumb
            handleTabClick={handleTabClick}
            tabs={tabs}
            activeTab={activeTab}
          />
        </DrawerHeader>
        <div className="relative mx-auto h-full w-full overflow-hidden">
          <AnimatePresence
            initial={false}
            custom={direction}
            mode="popLayout"
            onExitComplete={() => setIsAnimating(false)}
          >
            <motion.div
              key={activeTab}
              variants={variants}
              initial="initial"
              animate="active"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              custom={direction}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
        <DrawerFooter className="flex-row items-center justify-stretch">
          <AnimatedButton
            type="submit"
            variant="default"
            className="w-full"
            onClick={() => {
              if (activeTab + 1 < tabs.length) {
                handleTabClick(activeTab + 1);
              } else {
                createGroup();
              }
            }}
            isDisabled={
              isPending || imageUploadPending || groupName.length === 0
            }
            isLoading={isPending || imageUploadPending}
          >
            {activeTab + 1 === tabs.length ? "Create" : "Next"}
          </AnimatedButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateGroupForm;
