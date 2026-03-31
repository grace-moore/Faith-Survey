import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Survey from "@/pages/Survey";
import Results from "@/pages/Results";
import ThankYou from "@/pages/ThankYou";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      <p>Page not found.</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/survey" component={Survey} />
      <Route path="/results" component={Results} />
      <Route path="/thank-you" component={ThankYou} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
