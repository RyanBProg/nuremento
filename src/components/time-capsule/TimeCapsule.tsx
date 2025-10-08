import { TimeCapsuleOpenModal } from "./TimeCapsuleOpenModal";
import { TimeCapsuleSummary } from "./TimeCapsulesPanel";

type Props = {
  isReady?: boolean;
  showcase?: boolean;
  capsule: TimeCapsuleSummary;
};

export default function TimeCapsule({ showcase, isReady, capsule }: Props) {
  // check if passed capsule is ready to open
  return (
    <div className="flex h-28 sm:h-36">
      {/* left side */}
      <div className="relative rounded-l-full bg-linear-to-t from-neutral-600 from-5% via-neutral-500 to-95% to-neutral-600 border-2 flex justify-end items-center gap-3 w-[130px] sm:w-[200px] pr-8 sm:pr-10 shadow-[5px_5px_0_rgba(0,0,0,1)]">
        <span className="text-xs uppercase tracking-[0.3em] text-white text-right">
          {isReady ? "Ready" : "Locked"}
        </span>
        <div className="absolute z-10 right-0 translate-x-1/2 flex size-8 sm:size-10 items-center justify-center rounded-full border border-black bg-neutral-600">
          <div
            className={`size-5 sm:size-7 rounded-full border transition ${
              isReady ? "bg-green-500 scale-100" : "bg-red-500 scale-75"
            }`}
          />
        </div>
      </div>

      {/* right side */}
      <div className="relative rounded-r-full bg-linear-to-t from-neutral-500 from-5% via-neutral-400 to-95% to-neutral-500 border-2 border-l-0 flex justify-start items-center gap-3 w-[130px] sm:w-[200px] pl-8 sm:pl-10 shadow-[5px_5px_0_rgba(0,0,0,1)]">
        <TimeCapsuleOpenModal
          showcase={showcase}
          capsuleId={capsule.id}
          title={capsule.title}
          openOn={capsule.openOn}
          openedAt={capsule.openedAt}
          trigger={({ open }) => (
            <button
              type="button"
              onClick={open}
              disabled={!isReady}
              className="button-border">
              Open
            </button>
          )}
        />
      </div>
    </div>
  );
}
