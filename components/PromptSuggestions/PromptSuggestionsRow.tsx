import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({ onPromptClick }) => {
  const prompts = [
    "Are there any initiatives for sports activities?",
    "Whats with all the bike lanes?!",
    "What is the city doing about homelessness?",
    "How many Grammy Awards has Taylor won? 🏆",
  ];

  return (
    <div className="flex flex-row flex-wrap justify-center items-center py-4 gap-2 z-10">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton key={`suggestion-${index}`} text={prompt} onClick={() => onPromptClick(prompt)} />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
