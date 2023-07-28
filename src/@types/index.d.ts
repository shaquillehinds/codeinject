declare interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

declare interface CustomerUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

declare interface CustomerUpdateDto extends CustomerUpdate {
  id: string;
}

declare type Literal = string | number | boolean | RegExp | null;

declare type Collection<T = any> = import("jscodeshift").Collection<T>;

declare type YesOrNo = "Yes" | "No";
