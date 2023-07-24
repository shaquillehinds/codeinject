interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface CustomerUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

interface CustomerUpdateDto extends CustomerUpdate {
  id: string;
}

type Literal = string | number | boolean | RegExp | null;

type Collection<T = any> = import("jscodeshift").Collection<T>;
