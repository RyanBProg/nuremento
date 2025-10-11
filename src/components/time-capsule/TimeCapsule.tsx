import { TimeCapsuleOpenModal } from "./TimeCapsuleOpenModal";
import { TimeCapsuleSummary } from "./TimeCapsulesPanel";
import { formatDateOnly } from "@/lib/utils";

type TimeCapsuleProps = {
  capsule: TimeCapsuleSummary;
  showcase: boolean;
  isUnlockedOverride?: boolean;
};

function isDateInPastOrToday(value: string | null) {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  );

  return date <= todayStart;
}

export default function TimeCapsule({
  capsule,
  showcase,
  isUnlockedOverride,
}: TimeCapsuleProps) {
  const isReady =
    typeof isUnlockedOverride === "boolean"
      ? isUnlockedOverride
      : isDateInPastOrToday(capsule.openOn);

  return (
    <div className="max-w-min flex flex-col justify-between gap-3">
      <div className="flex h-28 sm:h-36">
        <div className="relative flex w-[130px] items-center justify-end gap-3 rounded-l-full border-2 bg-linear-to-t from-neutral-600 from-5% via-neutral-500 to-95% to-neutral-600 pr-8 shadow-[5px_5px_0_rgba(0,0,0,1)] sm:w-[200px] sm:pr-10">
          <span className="text-xs uppercase tracking-[0.3em] text-white">
            {isReady ? "Ready" : "Locked"}
          </span>
          <div className="absolute z-10 right-0 flex size-8 translate-x-1/2 items-center justify-center rounded-full border border-black bg-neutral-600 sm:size-10">
            <div
              className={`size-5 rounded-full border transition sm:size-7 ${
                isReady ? "scale-100 bg-green-500" : "scale-75 bg-red-500"
              }`}
            />
          </div>
        </div>

        <div className="relative flex w-[130px] items-center justify-start gap-3 rounded-r-full border-2 border-l-0 bg-linear-to-t from-neutral-500 from-5% via-neutral-400 to-95% to-neutral-500 pl-8 shadow-[5px_5px_0_rgba(0,0,0,1)] sm:w-[200px] sm:pl-10">
          <TimeCapsuleOpenModal
            capsule={capsule}
            mode={showcase ? "preview" : "live"}
            isUnlockedOverride={isUnlockedOverride}
          />
        </div>
      </div>
      {!showcase && (
        <div className="mt-5 space-y-2">
          <h4 className="text-lg font-semibold max-w-[250px] md:max-w-[350px] truncate">
            {capsule.title}
          </h4>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
            {formatDateOnly(capsule.openOn)}
          </p>
        </div>
      )}
    </div>
  );
}
