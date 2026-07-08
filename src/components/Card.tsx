import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

export type CardProps = {
  id: string;
  title: string;
  subtitle?: string;
  progress?: number;
  icon?: LucideIcon;
  buttonText?: string;
};

export const Card = ({ course }: { course: CardProps }) => {
  return (
    <div className="card-soft flex flex-col p-5 transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-center gap-3">
        {course.icon && (
          <span className={`grid size-12 place-items-center rounded-2xl text-2xl`}>
            <course.icon />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-bold text-foreground">{course.title}</h3>
          {course.subtitle && (
            <p className="truncate text-xs text-muted-foreground">{course.subtitle}</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        {course.progress && (
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Tiến độ</span>
            <span className="font-bold">{course.progress}%</span>
          </div>
        )}
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full bg-primary transition-all duration-700`}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>

      {course.buttonText && (
        <Button
          kind="solid"  
        >
          {course.buttonText}
        </Button>
      )}
    </div>
  );
}