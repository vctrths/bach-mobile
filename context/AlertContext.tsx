import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circle, Text, XStack, YStack } from "tamagui";

type ToastType = "success" | "error" | "info" | "warning";

interface AlertButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: "default" | "cancel" | "destructive";
}

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface AlertContextType {
  alert: (title: string, message: string, buttons?: AlertButton[]) => void;
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);
const USE_NATIVE_ANIMATION_DRIVER = Platform.OS !== "web";

const triggerHaptics = async (
  type: "success" | "error" | "warning" | "light",
) => {
  if (Platform.OS === "web") return;
  try {
    if (type === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === "error") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (type === "warning") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Ignore haptic errors on unsupported hardware or native environments
  }
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  // Toast State
  const [toastState, setToastState] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: "",
    type: "info",
  });

  // Modal State
  const [modalState, setModalState] = useState<{
    show: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    show: false,
    title: "",
    message: "",
    buttons: [],
  });
  const [modalActionPending, setModalActionPending] = useState(false);

  const insets = useSafeAreaInsets();
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations
  const toastAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.95)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  // Toast Anim triggers
  useEffect(() => {
    if (toastState.show) {
      Animated.spring(toastAnim, {
        toValue: 1,
        useNativeDriver: USE_NATIVE_ANIMATION_DRIVER,
        tension: 40,
        friction: 8,
      }).start();
    } else {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: USE_NATIVE_ANIMATION_DRIVER,
      }).start();
    }
  }, [toastState.show, toastAnim]);

  // Modal Anim triggers
  useEffect(() => {
    if (modalState.show) {
      Animated.parallel([
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          useNativeDriver: USE_NATIVE_ANIMATION_DRIVER,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: USE_NATIVE_ANIMATION_DRIVER,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: USE_NATIVE_ANIMATION_DRIVER,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: USE_NATIVE_ANIMATION_DRIVER,
        }),
      ]).start();
    }
  }, [modalState.show, modalScaleAnim, modalOpacityAnim]);

  // Toast show helper
  const showToast = (
    message: string,
    type: ToastType = "info",
    duration = 4000,
  ) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    triggerHaptics(type === "info" ? "light" : type);

    setToastState({
      show: true,
      message,
      type,
    });

    toastTimeoutRef.current = setTimeout(() => {
      setToastState((prev) => ({ ...prev, show: false }));
    }, duration);
  };

  // Modal show helper
  const showAlert = (
    title: string,
    message: string,
    buttons?: AlertButton[],
  ) => {
    Keyboard.dismiss();
    triggerHaptics("light");
    setModalActionPending(false);

    const defaultButtons: AlertButton[] = [
      {
        text: "OK",
        onPress: () => {},
        style: "default",
      },
    ];

    setModalState({
      show: true,
      title,
      message,
      buttons: buttons || defaultButtons,
    });
  };

  const closeToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastState((prev) => ({ ...prev, show: false }));
  };

  const handleButtonPress = async (onPress?: () => void | Promise<void>) => {
    if (modalActionPending) return;

    setModalActionPending(true);
    try {
      await triggerHaptics("light");
      if (onPress) {
        await onPress();
      }
    } catch (error) {
      console.error("[AlertContext] Modal action failed", error);
    } finally {
      setModalState((prev) => ({ ...prev, show: false }));
      setModalActionPending(false);
    }
  };

  // Colors & Icons for Toast
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark-circle" as const,
          color: "#698D14", // custom theme green
          bgIndicator: "#698D14",
        };
      case "error":
        return {
          icon: "alert-circle" as const,
          color: "#D32F2F", // theme error red
          bgIndicator: "#D32F2F",
        };
      case "warning":
        return {
          icon: "warning" as const,
          color: "#FF9800", // warning amber
          bgIndicator: "#FF9800",
        };
      case "info":
      default:
        return {
          icon: "information-circle" as const,
          color: "#2196F3", // info blue
          bgIndicator: "#2196F3",
        };
    }
  };

  const toastConfig = getToastConfig(toastState.type);
  const toastTranslateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 0],
  });

  return (
    <AlertContext.Provider value={{ alert: showAlert, toast: showToast }}>
      {children}

      {/* Floating Toast Rendering */}
      {toastState.show && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: insets.top + 8,
              transform: [{ translateY: toastTranslateY }],
              opacity: toastAnim,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={closeToast}
            style={styles.toastTouchable}
          >
            <YStack
              borderRadius={16}
              borderWidth={1}
              borderColor="rgba(0,0,0,0.05)"
              backgroundColor="rgba(255, 255, 255, 0.85)"
              overflow="hidden"
              boxShadow="0px 6px 20px rgba(23, 51, 0, 0.08)"
              flexDirection="row"
              padding={1}
            >
              {/* BlurView layer for glassmorphism */}
              <BlurView
                intensity={60}
                tint="light"
                experimentalBlurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFill}
              />

              {/* Status color left bar */}
              <YStack
                width={6}
                backgroundColor={toastConfig.bgIndicator}
                borderTopLeftRadius={15}
                borderBottomLeftRadius={15}
              />

              <XStack
                flex={1}
                alignItems="center"
                paddingHorizontal="$4"
                paddingVertical="$3"
                gap="$3"
              >
                <Ionicons
                  name={toastConfig.icon}
                  size={24}
                  color={toastConfig.color}
                />
                <Text
                  flex={1}
                  color="$text_dark"
                  fontSize="$4"
                  fontWeight="500"
                >
                  {toastState.message}
                </Text>
                <Circle
                  size={22}
                  backgroundColor="rgba(0,0,0,0.03)"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons name="close" size={14} color="#57594D" />
                </Circle>
              </XStack>
            </YStack>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Modal Dialog Rendering */}
      {modalState.show && (
        <Animated.View
          style={[styles.modalOverlay, { opacity: modalOpacityAnim }]}
        >
          <YStack
            style={StyleSheet.absoluteFill}
            justifyContent="center"
            alignItems="center"
          >
            {/* Dismiss keyboard on backdrop press, but keep the modal open */}
            <Pressable onPress={Keyboard.dismiss} style={StyleSheet.absoluteFill}>
              <BlurView
                intensity={35}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFill}
              />
            </Pressable>

            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: modalScaleAnim }],
                },
              ]}
            >
              {/* Modal Container with inner blur */}
              <YStack
                borderRadius={24}
                borderWidth={1}
                borderColor="rgba(0, 0, 0, 0.06)"
                backgroundColor="rgba(255, 255, 255, 0.9)"
                overflow="hidden"
                boxShadow="0px 10px 30px rgba(23, 51, 0, 0.15)"
                padding="$5"
                gap="$4"
              >
                <BlurView
                  intensity={80}
                  tint="light"
                  experimentalBlurMethod="dimezisBlurView"
                  style={StyleSheet.absoluteFill}
                />

                  {/* Header Title */}
                  <Text
                    color="$text_dark"
                    fontSize="$6"
                    fontWeight="bold"
                    textAlign="center"
                    fontFamily="$heading"
                  >
                    {modalState.title}
                  </Text>

                  {/* Message Body */}
                  <Text
                    color="$secondary"
                    fontSize="$3"
                    fontWeight="500"
                    lineHeight={22}
                    textAlign="center"
                    fontFamily="$body"
                  >
                    {modalState.message}
                  </Text>

                  {/* Action Buttons */}
                  <XStack
                    gap="$3"
                    flexDirection={
                      modalState.buttons.length === 2 ? "row" : "column"
                    }
                    marginTop="$2"
                  >
                    {modalState.buttons.map((btn, index) => {
                      // Map native style to custom Button variants
                      let variant: "primary" | "secondary" | "decline" =
                        "primary";
                      if (btn.style === "cancel") {
                        variant = "secondary";
                      } else if (btn.style === "destructive") {
                        variant = "decline";
                      }

                      return (
                        <Button
                          key={index}
                          label={btn.text}
                          variant={variant}
                          flex={modalState.buttons.length === 2 ? 1 : undefined}
                          disabled={modalActionPending}
                          opacity={modalActionPending ? 0.65 : undefined}
                          onPress={() => handleButtonPress(btn.onPress)}
                        />
                      );
                    })}
                  </XStack>
                </YStack>
              </Animated.View>
            </YStack>
        </Animated.View>
      )}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    ...Platform.select({
      web: {
        maxWidth: 500,
        alignSelf: "center",
        left: "50%",
        marginLeft: -250, // center on web/widescreen
        width: 500,
      },
    }),
  },
  toastTouchable: {
    width: "100%",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "88%",
    maxWidth: 420,
  },
});
