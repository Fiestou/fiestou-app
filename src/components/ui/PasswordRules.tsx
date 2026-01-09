import Icon from "@/src/icons/fontAwesome/FIcon";
import { PasswordRule } from "@/src/hooks/usePasswordValidation";

interface PasswordRulesProps {
  rules: PasswordRule[];
  errors: string[];
  completed: string[];
}

export function PasswordRules({ rules, errors, completed }: PasswordRulesProps) {
  return (
    <div className="border p-4 rounded grid text-sm">
      {rules.map((rule) => (
        <div key={rule.code} className="flex items-center gap-1">
          <div className="relative p-2">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {errors.includes(rule.code) ? (
                <Icon icon="fa-times" className="text-red-500" />
              ) : completed.includes(rule.code) ? (
                <Icon icon="fa-check" className="text-green-500" />
              ) : (
                <Icon icon="fa-minus" />
              )}
            </span>
          </div>
          <div>{rule.label}</div>
        </div>
      ))}
    </div>
  );
}

export default PasswordRules;
