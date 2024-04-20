"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ccImg from "./assets/citychats.png";
import Bubble from "../components/Bubble";
import { useChat } from "ai/react";
import Footer from "../components/Footer";
import PromptSuggestionRow from "../components/PromptSuggestions/PromptSuggestionsRow";
import { Message } from "ai";
import LoadingBubble from "../components/LoadingBubble";

export default function Home() {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePrompt = (promptText) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    };
    append(msg);
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <section className="chatbot-section flex flex-col origin:w-[800px] w-full md:h-[735px] h-full rounded-md px-2 md:px-6 md:py-4">
        {!messages || messages.length === 0 ? (
          <div className="h-full flex flex-col items-center">
            <Image src={ccImg} width="275" height="82.5" alt="CityChats logo" />
            <div className="h-full flex flex-col justify-center">
              <p className="chatbot-text-secondary-inverse text-lg text-center mt-2 md:mt-4 px-2">
                Keep up with your local government effortlessly through
                CityChat!
                <br />
                <br />
                Access and understand public record data from city council
                meetings with ease, empowering informed citizenship.
              </p>
              <PromptSuggestionRow onPromptClick={handlePrompt} />
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex flex-col items-center">
              <Image
                src={ccImg}
                width="250"
                height="75"
                alt="Swiftie GPT logo"
              />
            </div>
            <div className="md:hidden header relative text-white p-4 pb-16 rounded-t-md overflow-hidden">
              <div className="absolute inset-0 clip-path-header"></div>
              <Image
                className="absolute right-10 z-10"
                src={ccImg}
                width="83"
                height="23"
                alt="SwiftieGPT logo"
              />
            </div>
            <div className="flex-1 relative overflow-y-auto my-4 md:my-6">
              <div className="absolute w-full h-full overflow-x-hidden">
                {messages.map((message, index) => (
                  <Bubble
                    ref={messagesEndRef}
                    key={`message-${index}`}
                    content={message}
                  />
                ))}
                {isLoading && messages?.length % 2 !== 0 && (
                  <LoadingBubble ref={messagesEndRef} />
                )}
              </div>
            </div>
          </>
        )}
        <div className="relative text-white p-4 pt-16 rounded-b-md footer overflow-hidden">
          <div className="absolute inset-0 clip-path-footer"></div>
          <div className="relative z-10">
            <form className="flex h-[40px] gap-2" onSubmit={handleSubmit}>
              <input
                onChange={handleInputChange}
                value={input}
                className="chatbot-input flex-1 text-sm md:text-base outline-none bg-transparent rounded-lg p-2"
                placeholder="Send a message..."
              />
              <button
                type="submit"
                className="chatbot-send-button flex rounded-md items-center justify-center px-2.5 origin:px-3"
              >
                <span className="font-semibold text-sm">Send</span>
              </button>
            </form>
            <Footer />
          </div>
        </div>
      </section>
    </main>
  );
}
