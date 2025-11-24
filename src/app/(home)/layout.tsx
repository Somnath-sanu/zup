import { Navbar } from "@/modules/home/ui/components/navbar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <main className="flex flex-col min-h-screen relative">
      <Navbar />

      <div className="fixed inset-0 -z-10 h-full w-full">
        <div className="absolute  dark:opacity-0 z-100 opacity-100 inset-0 bg-black/20"/>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 dark:opacity-0 opacity-100"
          style={{
            backgroundImage: "url(/anime-background.png)",
          }}
        />

        <div
          className="absolute inset-0 transition-opacity duration-500 dark:opacity-100 opacity-0"
          style={{
            backgroundImage: "url(/anime-background-dark.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 pb-4 relative z-0">
        {children}
      </div>
    </main>
  );
};

export default Layout;
