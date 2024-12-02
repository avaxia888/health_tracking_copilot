"use client";

import HomePage from "./home"
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

// ck_pub_697289b72f11f11990ded02452241b39
export default function Home() {
  return (
    <CopilotKit publicApiKey="ck_pub_697289b72f11f11990ded02452241b39">
      <HomePage></HomePage>
      <CopilotPopup
      labels={{
        title: "Health Copilot",
        initial: "Hi! 👋 How can I be of help to you today?",
      }}
/>
    </CopilotKit>
  )
}