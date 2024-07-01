import { cn } from "@/lib/utils";
import { AnimationProps, motion } from "framer-motion";

const getSpans = () => {
  return [...new Array(12)].map((_, index) => (
    <span
      key={`spinner-${index}`}
      className="absolute left-[-10%] top-[-3.9%] h-[8%] w-[24%] rounded-[2px] bg-background"
    >
      <style jsx>{`
        span {
          animation: spinner 1.2s linear 0s infinite normal none running;
        }

        span:nth-child(1) {
          animation-delay: -1.2s;
          transform: rotate(0deg) translate(146%);
        }

        span:nth-child(2) {
          animation-delay: -1.1s;
          transform: rotate(30deg) translate(146%);
        }

        span:nth-child(3) {
          animation-delay: -1s;
          transform: rotate(60deg) translate(146%);
        }

        span:nth-child(4) {
          animation-delay: -0.9s;
          transform: rotate(90deg) translate(146%);
        }

        span:nth-child(5) {
          animation-delay: -0.8s;
          transform: rotate(120deg) translate(146%);
        }

        span:nth-child(6) {
          animation-delay: -0.7s;
          transform: rotate(150deg) translate(146%);
        }

        span:nth-child(7) {
          animation-delay: -0.6s;
          transform: rotate(180deg) translate(146%);
        }

        span:nth-child(8) {
          animation-delay: -0.5s;
          transform: rotate(210deg) translate(146%);
        }

        span:nth-child(9) {
          animation-delay: -0.4s;
          transform: rotate(240deg) translate(146%);s
        }

        span:nth-child(10) {
          animation-delay: -0.3s;
          transform: rotate(270deg) translate(146%);
        }

        span:nth-child(11) {
          animation-delay: -0.2s;
          transform: rotate(300deg) translate(146%);
        }

        span:nth-child(12) {
          animation-delay: -0.1s;
          transform: rotate(330deg) translate(146%);
        }

        @keyframes spinner {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0.15;
          }
        }
      `}</style>
    </span>
  ));
};

const Spinner = ({
  className,
  AnimationProps,
  ...props
}: {
  className?: string;
  AnimationProps?: AnimationProps;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.2 }}
      className={cn("block h-5 w-5", className)}
      {...AnimationProps}
      {...props}
    >
      <div className="relative left-[50%] top-[50%] h-full w-full">
        {getSpans()}
      </div>
    </motion.div>
  );
};

export default Spinner;
