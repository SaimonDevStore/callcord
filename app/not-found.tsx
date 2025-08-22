import Link from "next/link";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <h1 className="text-9xl font-medium">404</h1>
      <h2 className="text-xl font-medium">Página não encontrada.</h2>
      <Button variant="primary" asChild>
        <Link href="/">Voltar</Link>
      </Button>
    </div>
  );
};

export default NotFound;
