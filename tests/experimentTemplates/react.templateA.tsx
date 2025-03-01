//@ts-nocheck
import { API_URL } from "@/constants";
import { Message, useChat } from "@/hooks/ai/chat/useChatNew";
import { storage } from "@/libs/mmkv";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image } from "expo-image";
import {
  Clipboard,
  FlatList,
  View,
  LayoutChangeEvent,
  Dimensions,
  Alert,
} from "react-native";
import Button from "@/components/common/Button";
import SFText from "@/components/common/SFText";
import { FONT_FAMILY } from "@/libs/font";
import { cn } from "@/libs/cn";
import useChat2 from "@/hooks/platform/studyset/chat/useChat";
import {
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVString,
} from "react-native-mmkv";
import { ImagePickerAsset } from "expo-image-picker";
import {
  AntDesign,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import Press from "@/components/common/Press";
import Markdown from "react-native-markdown-display";
import { MenuView } from "@react-native-menu/menu";
import { ToolInvocation } from "@/types/new";
import ToolDiagram from "./message/tools/Diagram";
import ToolPracticeMatchGame from "./message/tools/practice/MatchGame";
import ToolPracticeFlashcards from "./message/tools/practice/Flashcards";
import ToolPracticeQuiz from "./message/tools/practice/Quiz";
import ToolPracticeTest from "./message/tools/practice/Test";
import { UIComponentRegistry, uiComponents } from "@/utils/Tools";
import ToolWebResult from "./message/tools/WebResult";
import { useColorScheme } from "nativewind";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import ChatV2ExampleMessagesTest from "./examples/Tests";
import ChatV2ExampleMessagesQuizzes from "./examples/Quizzes";
import ChatV2ExampleMessages from "./examples";
import ChatV2ExampleMessagesMaterial from "./examples/Material";
import ChatV2Empty from "./Empty";
import ChatV2ExampleMessagesPhoto from "./examples/Photo";
import ChatV2ExampleMessagesFlashcards from "./examples/Flashcards";
import { usePayment } from "@/components/common/provider/PaymentProvider";
import { useTranslation } from "@/hooks/useTranslation";
import ChatV2ExampleMessagesLiveLecture from "./examples/LiveLecture";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import XIcon from "@/components/common/icons/X";
import useIsIpad from "@/hooks/isIpad";
import WoflframTool from "./message/tools/Wolfram";
import HomeNewContent from "../home/new/Content";
import { mutate } from "swr";
import { useChatAndroid } from "@/hooks/ai/chat/3.4.33/useChat3433";
import { Platform } from "react-native";
import ToolAddToBio from "./message/tools/AddToBio";
import AcademicSearch from "./message/tools/AcademicSearch";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import useUser from "@/hooks/platform/user/useUser";
import HomeRotatingList from "../home/new/RotatingList";

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface SearchOrNull {
  title: string;
  snippet: string;
  url: string;
  favicon: string;
  age: string;
}

export const MarkdownThingy = React.memo(({ content }: { content: string }) => {
  const [debouncedContent, setDebouncedContent] = useState(content);
  const { colorScheme } = useColorScheme();

  const debouncedSetContent = useCallback(
    debounce((value: string) => {
      setDebouncedContent(value);
    }, 25),
    [],
  );

  useEffect(() => {
    debouncedSetContent(content);
  }, [content, debouncedSetContent]);

  const isIpad = false;

  return (
    <Markdown
      style={{
        heading1: {
          fontSize: isIpad ? 18 : 20,
          color: colorScheme === "dark" ? "white" : "black",
          fontFamily: "Poppins_600SemiBold",
        },
        heading2: {
          fontSize: isIpad ? 14 : 16,
          color: colorScheme === "dark" ? "white" : "black",
          fontFamily: "Poppins_600SemiBold",
        },
        heading3: {
          fontSize: isIpad ? 12 : 14,
          color: colorScheme === "dark" ? "white" : "black",
          fontFamily: "Poppins_500Medium",
        },
        heading4: {
          fontSize: isIpad ? 10 : 12,
          color: colorScheme === "dark" ? "white" : "black",
          fontFamily: "Poppins_500Medium",
        },
        heading5: {
          fontSize: isIpad ? 8 : 10,
          color: colorScheme === "dark" ? "white" : "black",
        },
        heading6: {
          fontSize: isIpad ? 6 : 8,
          color: colorScheme === "dark" ? "white" : "black",
          fontFamily: "Poppins_500Medium",
        },
        body: {
          fontSize: isIpad ? 12 : 15,
          color: colorScheme === "dark" ? "white" : "black",
          fontFamily: "Poppins_500Medium",
        },
        blockquote: {
          fontSize: isIpad ? 12 : 15,
          color: colorScheme === "dark" ? "white" : "black",
          backgroundColor: colorScheme === "dark" ? "#27272a" : "#f8f8f8",
          borderRadius: 0,
          borderColor: colorScheme === "dark" ? "#3f3f46" : "#ffffff",
          marginLeft: 0,
          paddingLeft: 10,
        },
      }}
    >
      {debouncedContent}
    </Markdown>
  );
});

function ToolUsage({
  msg,
  toolInvocation,
}: {
  msg: string;
  toolInvocation: ToolInvocation;
}) {
  if (toolInvocation.state !== "result" || !toolInvocation.result) {
    return null;
  }

  if (toolInvocation.toolName === "academicSearch") {
    return <AcademicSearch args={toolInvocation.result.ui.args} />;
  }

  const result = toolInvocation.result.ui;
  const args = result.args;

  if (toolInvocation.toolName === "queryWolfram") {
    return <WoflframTool args={toolInvocation.result.ui.args} />;
  }

  if (toolInvocation.toolName === "createDiagram") {
    return <ToolDiagram url={toolInvocation.result.ui.args.definition} />;
  }

  if (toolInvocation.toolName === "matchingGame") {
    return <ToolPracticeMatchGame />;
  }

  if (toolInvocation.toolName === "createFlashcards") {
    return <ToolPracticeFlashcards />;
  }

  if (
    toolInvocation.toolName === "createTest" &&
    msg.toLowerCase().includes("quiz")
  ) {
    return <ToolPracticeQuiz />;
  }

  if (toolInvocation.toolName === "createTest") {
    return <ToolPracticeTest />;
  }

  if (toolInvocation.toolName === "searchWeb") {
    console.log($lf(213), "toolInvocation", toolInvocation);
    const title =
      uiComponents[
        toolInvocation.result.ui.component as keyof UIComponentRegistry
      ]?.title || "";

    return <ToolWebResult title={title} args={args} />;
  }

  /**
   * toolInvocation {"args": {"text": "Student has reaffirmed their commitment to improving their computer coding skills, showing consistent interest in programming development."}, "result": {"text": "bio updated, continue the conversation.", "ui": {"args": [Object], "component": "memory"}}, "state": "result", "toolCallId": "toolu_01QLnLk3EKp3oB1UPkK65DZn", "toolName": "add-to-bio"}
   */

  if (toolInvocation.toolName === "add-to-bio") {
    return <ToolAddToBio args={toolInvocation.args} />;
  }

  return <></>;
}

export default function ChatV2MessageList({
  chatRoute,
  studySetId,
  selectedMaterials,
  chatId,
  setTextInput,
  addMessage,
  memorizedDog,
  memorizedLoading,
  username,
  colorScheme,
  keyboardShown,
  addPhotoToChat,
  uploadedFile,
  setUploadedFile,
  webBrowsing,
  academicBrowser,
  customization,
  chatData,
  chatType,
  clearMessages = false,
  setClearMessages,
  isHome,
  onOpen,
}: {
  chatRoute: string;
  studySetId: string;
  selectedMaterials: string[];
  chatId: string;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  addMessage: string;
  memorizedDog: React.ReactNode;
  memorizedLoading: React.ReactNode;
  username: string;
  colorScheme: string;
  keyboardShown: boolean;
  addPhotoToChat: {
    image: string;
    fileType: string;
    height: number;
    width: number;
  } | null;
  uploadedFile: ImagePickerAsset | null;
  setUploadedFile: React.Dispatch<
    React.SetStateAction<ImagePickerAsset | null>
  >;
  webBrowsing: boolean;
  academicBrowser: boolean;
  customization: string;
  chatData?: string;
  chatType?: string;
  clearMessages?: boolean;
  setClearMessages?: React.Dispatch<React.SetStateAction<boolean>>;
  isHome?: boolean;
  onOpen?: () => void;
}) {
  const flatListRef = useRef<FlatList<Message>>(null);
  const { data, isChatLoading } = useChat2(chatId || "");
  const { data: userData } = useUser();
  const [imageUploads, setImageUploads] = useState<
    {
      messageIndex: number;
      image: string;
      fileType: string;
      height: number;
      width: number;
    }[]
  >([]);
  const [webSearches, setWebSearches] = useState<(SearchOrNull[] | null)[]>([]);
  const [lastMessageHeight, setLastMessageHeight] = useState(0);
  const lastScrollPositionRef = useRef(0);
  const isStreamingRef = useRef(false);
  const [keyboardReallyOpen, setKeyboardReallyOpen] = useState(false);
  const { togglePremium } = usePayment();
  const t = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const [paused, setPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [forceClear, setForceClear] = useMMKVBoolean("chat.forceClear");
  const [liveLectureTranscriptCount, setLiveLectureTranscriptCount] =
    useMMKVNumber("livelecture.transcriptCount");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuHeight = useSharedValue(0);

  const { chat } = useLocalSearchParams() as {
    chat: string;
  };

  useEffect(() => {
    if (chat) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Hello ${userData?.user?.name}! I'm your new AI tutor. How can I help you today?`,
        createdAt: new Date(),
      };

      setMessages([newMessage]);
      setTextInput("");

      router.setParams({ chat: undefined });
    }
  }, [chat, userData]);

  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const fadeStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withTiming(isSpeaking ? 1 : 0, { duration: 300 });
  }, [isSpeaking]);

  const {
    messages,
    // @ts-ignore
    input,
    // @ts-ignore
    handleSubmit,
    // @ts-ignore
    setInput,
    // @ts-ignore
    isLoading,
    // @ts-ignore
    append,
    // @ts-ignore
    setMessages,
    // @ts-ignore
    addToolResult,
    stop,
  } =
    Platform.OS === "android"
      ? useChatAndroid({
          api: API_URL + chatRoute,
          body: {
            type: chatType ?? "studyset",
            data: chatData ?? {
              id: studySetId,
              materials: selectedMaterials,
              chatId,
            },
            webBrowser: webBrowsing,
            ratingIds: [],
            images: imageUploads,
            webSearches: webSearches,
          },
          onFinish: async (message: Message) => {
            console.log($lf(393), "Message finished", message);
          },
          onResponse: (response) => {
            handleResponse(response);
          },
          maxToolRoundtrips: 3,
          streamProtocol: Platform.OS === "android" ? "data" : "text",
          onError: (error) => {
            console.log($lf(401), "Error", error);
          },
        })
      : useChat({
          api: API_URL + chatRoute,
          body: {
            type: chatType ?? "studyset",
            data: chatData ?? {
              id: studySetId,
              materials: selectedMaterials,
              chatId,
            },
            academicBrowser: webBrowsing ? false : academicBrowser,
            webBrowser: academicBrowser ? true : webBrowsing,
            ratingIds: [],
            images: imageUploads,
            webSearches: webSearches,
            isMobile: true,
          },
          onFinish: async (message: Message) => {},
          onResponse: (response) => {
            handleResponse(response);
          },
          maxToolRoundtrips: 3,
          streamProtocol: "text",
          onError: (error) => {
            console.log($lf(427), "Error", error);
          },
        });

  const handleResponse = useCallback(
    async (response: Response) => {
      const chatId = response.headers.get("x-chat-id");
      if (chatId) {
        mutate(API_URL + `/platform/studyset/${studySetId}/chat/session/list`);
        storage.set(`chat.id`, chatId);
      }

      const usedWebSearch = response.headers.get("x-web-search");
      const sources = response.headers.get("x-web-search-sources");
      if (usedWebSearch == "true" && sources != null) {
        const sources = JSON.parse(
          response.headers.get("x-web-search-sources") as string,
        );

        setWebSearches((prev) => {
          return [...prev, sources];
        });
      } else {
        // Add empty array to keep the index
        setWebSearches((prev) => [...prev, null]);
      }
    },
    [messages, setWebSearches, webSearches, studySetId],
  );

  const handleCopy = (content: string) => {
    Clipboard.setString(content);
  };

  const handleMessageLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setLastMessageHeight(height);
  }, []);

  const scrollToLatestMessage = useCallback(
    debounce(() => {
      if (isStreamingRef.current) return;

      const windowHeight = Dimensions.get("window").height;
      const maxVisibleHeight = keyboardShown
        ? windowHeight * 0.375
        : windowHeight * 0.65;

      const newScrollPosition = Math.max(
        0,
        lastMessageHeight - maxVisibleHeight,
      );

      if (Math.abs(newScrollPosition - lastScrollPositionRef.current) > 50) {
        /**
        *  flatListRef.current?.scrollToOffset({
          offset: newScrollPosition,
          animated: true,
        });
        */
        lastScrollPositionRef.current = newScrollPosition;
      }
    }, 100),
    [lastMessageHeight, keyboardShown],
  );

  useEffect(() => {
    isStreamingRef.current = isLoading;
    if (!isLoading) {
      scrollToLatestMessage();
    }
  }, [isLoading, scrollToLatestMessage]);

  useEffect(() => {
    if (keyboardShown) {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
      lastScrollPositionRef.current = 0;
    }
  }, [keyboardShown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (keyboardShown) {
      timer = setTimeout(() => {
        setKeyboardReallyOpen(true);
      }, 1000); // 1 second delay
    } else {
      setKeyboardReallyOpen(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [keyboardShown]);

  const handleSpeak = useCallback(
    async (content: string, messageId: string) => {
      const speaking = await Speech.isSpeakingAsync();

      if (speaking) {
        await Speech.stop();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        return;
      }

      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
      Speech.speak(content, {
        rate: 0.9,
        pitch: 1.0,
        language: "en-US",
        onDone: () => {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        },
      });
    },
    [],
  );

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setElapsedTime(0);
    setPaused(false);
  }, []);

  const toggleSpeaking = useCallback(() => {
    const status = !paused;
    if (status) {
      Speech.pause();
      rotation.value = withTiming(0, { duration: 300 });
    } else {
      Speech.resume();
      rotation.value = withTiming(180, { duration: 300 });
    }
    setPaused(status);
  }, [paused, rotation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking && !paused) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking, paused]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const needsUpgrade =
        item.content === `You need to upgrade your plan to continue using chat`;

      if (needsUpgrade) {
        return (
          <View className="flex flex-row items-center mt-4 pb-4">
            <View className="bg-transparent rounded-full h-12 w-12 flex items-center justify-center">
              <Image
                source={require("@/assets/gifs/thinking.gif")}
                style={{ height: 40, width: 40 }}
              />
            </View>

            <Button
              customStyle="py-2"
              variant="primary"
              onPress={() => togglePremium(t("h2b54cswqsf"))}
            >
              <SFText
                className="text-white text-sm"
                style={{
                  fontFamily: FONT_FAMILY.Poppins_500Medium,
                }}
              >
                {t("8vlsrrhb3hp")}
              </SFText>
            </Button>
          </View>
        );
      }

      const attachments = item.experimental_attachments;
      const attachment = attachments ? attachments[0] : undefined;

      return (
        <Animated.View
          onLayout={index === 0 ? handleMessageLayout : undefined}
          key={index}
        >
          {item && (
            <View
              className={cn(
                "flex flex-row mt-4",
                isLoading &&
                  index === messages.length - 1 &&
                  item.role !== "assistant" &&
                  "pb-0",
              )}
            >
              {item.role === "assistant" && <>{memorizedDog}</>}

              <View
                className={cn(
                  "ml-auto",
                  item.role === "assistant" && "w-[85%]",
                )}
              >
                {customization && item.role === "assistant" && (
                  <SFText
                    className={cn(
                      "text-base text-primary",
                      colorScheme === "dark" && "text-white",
                    )}
                    style={{
                      fontFamily: FONT_FAMILY.Poppins_700Bold,
                    }}
                  >
                    {customization}
                  </SFText>
                )}

                <MenuView
                  title="Message Options"
                  onPressAction={({ nativeEvent }) => {
                    if (nativeEvent.event === "copy") {
                      handleCopy(item.content);
                    } else if (nativeEvent.event === "speak") {
                      handleSpeak(item.content, item.id);
                    }
                  }}
                  actions={
                    item.role === "assistant"
                      ? [
                          { id: "copy", title: "Copy", image: "clipboard" },
                          { id: "good", title: "Good", image: "hand.thumbsup" },
                          { id: "bad", title: "Bad", image: "hand.thumbsdown" },
                          {
                            id: "speak",
                            title: "Speak Aloud",
                            image: "speaker.2", // Changed from "speaker.wave" to "speaker.2"
                          },
                        ]
                      : [{ id: "copy", title: "Copy", image: "clipboard" }]
                  }
                  shouldOpenOnLongPress
                  themeVariant={colorScheme}
                >
                  {item.role === "user" ? (
                    <>
                      {attachment && (
                        <View>
                          <Image
                            source={{
                              uri: attachment.url,
                            }}
                            className="w-36 h-36 mb-2 ml-auto"
                            contentFit="contain"
                          />
                        </View>
                      )}

                      <View
                        className={cn(
                          "px-4 py-2 rounded-2xl bg-white ml-auto text-right",
                          colorScheme === "dark" && "bg-zinc-800",
                        )}
                      >
                        <SFText
                          className={cn(
                            "text-[15px] text-primary",
                            item.role === "user" && "ml-auto",
                            colorScheme === "dark" && "text-white",
                          )}
                          key={`item-${item.id}`}
                          style={{
                            fontFamily: FONT_FAMILY.Poppins_500Medium,
                          }}
                        >
                          {item.content}
                        </SFText>
                      </View>
                    </>
                  ) : (
                    <SFText
                      className={cn(
                        "text-[15px]  text-black",
                        colorScheme === "dark" && "text-white",
                      )}
                      key={`item-${item.id}`}
                      style={{
                        fontFamily: FONT_FAMILY.Poppins_500Medium,
                      }}
                    >
                      {item.content
                        ? removeMarkdown(item.content).replaceAll(
                            "{USERNAME}",
                            username,
                          )
                        : ""}
                    </SFText>
                  )}
                </MenuView>

                {item.toolInvocations &&
                  item.toolInvocations.map((toolInvocation, index) => (
                    <ToolUsage
                      msg={item.content}
                      key={index}
                      toolInvocation={toolInvocation}
                    />
                  ))}
              </View>
            </View>
          )}

          {isLoading && index === 0 && item.role !== "assistant" && (
            <>{memorizedLoading}</>
          )}
        </Animated.View>
      );
    },
    [isLoading, messages, username, colorScheme, handleMessageLayout],
  );

  useEffect(() => {
    if (!data) return;

    if (data.messages) {
      const parsed = JSON.parse(data.messages);
      setMessages(parsed.messages);
    }
  }, [data]);

  const path = usePathname();

  const handleAppendMessage = useCallback(
    async (message: string) => {
      if (!message) return;

      const isLiveLecture = path.includes("live-lecture");

      storage.set(`canSendMessage`, false);

      setTextInput("");
      const mostRecentImageUpload = imageUploads[imageUploads.length - 1];

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        createdAt: new Date(),
        experimental_attachments:
          messages.length === 0 && mostRecentImageUpload
            ? [
                {
                  url: mostRecentImageUpload.image,
                  contentType: mostRecentImageUpload.fileType,
                },
              ]
            : mostRecentImageUpload &&
              (uploadedFile || path.includes("material"))
            ? [
                {
                  url: mostRecentImageUpload.image,
                  contentType: mostRecentImageUpload.fileType,
                },
              ]
            : [],
      };
      setUploadedFile(null);

      if (liveLectureTranscriptCount === 0 && isLiveLecture) {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "You need to have a transcript to use this feature",
          createdAt: new Date(),
        };

        const toAdd = [...messages, userMessage, newMessage];

        setMessages(toAdd);

        storage.set(`canSendMessage`, true);
        return;
      }

      flatListRef.current?.scrollToOffset({
        animated: true,
        offset: 0,
      });

      await append(userMessage);
      storage.set(`canSendMessage`, true);
    },
    [
      imageUploads,
      uploadedFile,
      append,
      setTextInput,
      flatListRef,
      path,
      liveLectureTranscriptCount,
      path,
    ],
  );

  useEffect(() => {
    if (!addMessage) return;

    handleAppendMessage(addMessage);
  }, [addMessage]);

  useEffect(() => {
    if (!addPhotoToChat) return;

    setImageUploads((prev) => [
      ...prev,
      {
        messageIndex: messages.length,
        ...addPhotoToChat,
      },
    ]);
  }, [addPhotoToChat]);

  useEffect(() => {
    if (!clearMessages) return;

    setMessages([]);
    setClearMessages && setClearMessages(false);
  }, [clearMessages]);

  useEffect(() => {
    if (forceClear) {
      setMessages([]);
      storage.set("chat.forceClear", false);
      /**
      *  stop();
      stopSpeaking();
      */
    }
  }, [forceClear, stop, stopSpeaking]);

  useEffect(() => {
    if (messages.length === 0) return;

    storage.set(`cached-messages`, JSON.stringify(messages));
  }, [messages]);

  const [cached] = useMMKVString(`cached-messages`);
  const { isIpad } = useIsIpad();

  const memorizedHomeContent = useMemo(
    () => <HomeNewContent onOpen={() => onOpen && onOpen()} />,
    [colorScheme, t, onOpen],
  );

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: menuHeight.value,
      opacity: interpolate(menuHeight.value, [0, 300], [0, 1]),
      transform: [
        {
          translateY: interpolate(menuHeight.value, [0, 300], [20, 0]),
        },
      ],
    };
  });

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
    menuHeight.value = withSpring(isMenuOpen ? 0 : 300, {
      damping: 15,
      stiffness: 100,
    });
  }, [isMenuOpen]);

  return (
    <>
      {isSpeaking && (
        <Animated.View
          className={cn(
            "flex flex-row items-center absolute -top-10 left-0 w-full bg-background p-4 shadow-md rounded-2xl",
            colorScheme === "dark" && "bg-zinc-900",
            isIpad && "-top-4 shadow-xl ml-2",
          )}
          style={[
            {
              zIndex: 9999,
            },
            fadeStyle,
          ]}
        >
          <Press onPress={toggleSpeaking}>
            <Animated.View style={animatedStyle}>
              {paused ? (
                <Ionicons
                  name="play"
                  size={28}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              ) : (
                <AntDesign
                  name="pause"
                  size={28}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              )}
            </Animated.View>
          </Press>

          <SFText
            className={cn(
              "ml-2 text-primary mt-px text-base",
              colorScheme === "dark" && "text-white",
            )}
            style={{
              fontFamily: FONT_FAMILY.Poppins_500Medium,
            }}
          >
            {formatTime(elapsedTime)}
          </SFText>

          <View className="ml-auto">
            <Press onPress={stopSpeaking}>
              <XIcon width={16} height={16} />
            </Press>
          </View>
        </Animated.View>
      )}

      <Animated.FlatList
        ref={flatListRef}
        data={
          isChatLoading && chatId
            ? cached
              ? JSON.parse(cached).slice().reverse()
              : []
            : messages.slice().reverse()
        }
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{
          paddingTop: keyboardShown ? 20 : 5,
          flexGrow: 1,
          justifyContent: "flex-end",
        }}
        inverted={true}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={isHome ? memorizedHomeContent : ChatV2Empty}
        itemLayoutAnimation={
          isChatLoading && chatId ? undefined : LinearTransition.duration(300)
        }
      />

      {isHome && messages.length > 0 && (
        <View className="flex flex-row justify-end items-center">
          <Press
            onPress={() => {
              Alert.alert(
                t("xv9piguc6xb"), // "Clear Chat"
                t("hnwibx77y5r"), // "All of your messages in this chat will be lost. Are you sure you want to continue?"
                [
                  {
                    text: t("lv0doyfnbp8"), // "Cancel"
                    style: "cancel",
                  },
                  {
                    text: t("j4l1tp23bo"), // "Delete"
                    style: "destructive",
                    onPress: () => {
                      storage.set("chat.forceClear", true);
                      storage.delete("cached-messages");
                      storage.delete(`chat.id`);

                      setMessages([]);
                      setImageUploads([]);
                      setUploadedFile(null);
                      setTextInput("");

                      setTimeout(() => {
                        storage.set("chat.forceClear", true);
                        storage.delete("cached-messages");
                        storage.delete(`chat.id`);
                      }, 250);
                    },
                  },
                ],
              );
            }}
            className={cn(
              "mb-2 bg-white rounded-full p-2 flex flex-row items-center mr-2",
              colorScheme === "dark" && "bg-zinc-900",
            )}
          >
            <MaterialCommunityIcons
              name="restore"
              size={24}
              color={colorScheme === "dark" ? "white" : "black"}
            />

            <SFText
              className={cn(
                "text-sm text-black ml-2",
                colorScheme === "dark" && "text-white",
              )}
              style={{
                fontFamily: FONT_FAMILY.Poppins_600SemiBold,
              }}
            >
              {t("s5vsgfzn99")}
            </SFText>
          </Press>

          <View>
            <Animated.View
              className={cn(
                "absolute bottom-full right-0 mb-2 bg-white rounded-xl overflow-hidden w-48",
                colorScheme === "dark" && "bg-zinc-900",
              )}
              style={menuAnimatedStyle}
            >
              <HomeRotatingList columnStyle onCloseMenu={toggleMenu} />
            </Animated.View>

            <Press
              onPress={toggleMenu}
              className={cn(
                "mb-2 bg-white rounded-full p-2 flex flex-row items-center",
                colorScheme === "dark" && "bg-zinc-900",
              )}
            >
              <Octicons
                name="stack"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </Press>
          </View>
        </View>
      )}

      <View
        className={cn(
          "h-auto",
          keyboardShown && "pb-2",
          uploadedFile && "hidden",
          isHome && "hidden",
        )}
      >
        {chatType === "test" && messages.length === 0 && (
          <ChatV2ExampleMessagesTest
            onSelect={(str) => handleAppendMessage(str)}
          />
        )}

        {chatType === "quiz" && messages.length === 0 && (
          <ChatV2ExampleMessagesQuizzes
            onSelect={(str) => handleAppendMessage(str)}
          />
        )}

        {chatType === "material" && messages.length === 0 && (
          <ChatV2ExampleMessagesMaterial
            onSelect={(str) => handleAppendMessage(str)}
          />
        )}

        {chatType === "flashcard" && messages.length === 0 && (
          <ChatV2ExampleMessagesFlashcards
            onSelect={(str) => handleAppendMessage(str)}
          />
        )}

        {chatType === "livelecture2" && messages.length === 0 && (
          <ChatV2ExampleMessagesLiveLecture
            onSelect={(str) => handleAppendMessage(str)}
          />
        )}

        {!chatType && messages.length === 0 && (
          <ChatV2ExampleMessages onSelect={(str) => handleAppendMessage(str)} />
        )}
      </View>

      <View
        className={cn(
          "h-auto",
          keyboardShown && "pb-2",
          !uploadedFile && "hidden",
        )}
      >
        {messages.length === 0 && (
          <ChatV2ExampleMessagesPhoto
            onSelect={(str) => handleAppendMessage(str)}
          />
        )}
      </View>
    </>
  );
}

function removeMarkdown(text: string): string {
  return (
    text
      // Remove headers
      .replace(/^#{1,6}\s/gm, "")
      // Remove bold and italic
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove blockquotes
      .replace(/^\s*>\s/gm, "")
      // Remove horizontal rules
      .replace(/^-{3,}|_{3,}|\*{3,}$/gm, "")
      // Remove links
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      // Remove images
      .replace(/!\[([^\]]+)\]\([^\)]+\)/g, "")
      // Remove ordered and unordered list symbols
      .replace(/^\s*[\d*+-]\s/gm, "")
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Trim whitespace
      .trim()
  );
}

function $lf(n: number) {
  return "$lf|local/expirementTemplates/react.templateA.tsx:" + n + " >";
  // Automatically injected by Log Location Injector vscode extension
}
