import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VideoList from "./components/VideoList";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <header className="bg-primary text-primary-foreground p-4">
          <h1 className="text-2xl font-bold">Video Stream</h1>
        </header>
        <main className="container mx-auto px-4 py-8">
          <VideoList />
        </main>
      </div>
    </QueryClientProvider>
  );
}
