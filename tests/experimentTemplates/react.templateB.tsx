import Press from "@/components/common/Press";
import SFText from "@/components/common/SFText";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/libs/cn";
import { FONT_FAMILY } from "@/libs/font";
import { storage } from "@/libs/mmkv";
import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  getSubscriptions,
  requestSubscription,
  SubscriptionOffer,
  useIAPContext,
} from "react-native-iap";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/common/Button";
import Plan from "./plans/Plan";
import LoadingScreen from "@/components/common/LoadingScreen";
import { router } from "expo-router";
import XIcon from "@/components/common/icons/X";
import { isAndroid } from "@/constants";
import {
  androidSubscriptionIds,
  getPaymentPlan,
  iosSubscriptionIds,
  monthlyPrice,
  PaymentPlan,
  quarterlyPrice,
  subscriptionIds,
  yearlyPrice,
} from "@/constants/Subscriptions";

export default function Payment({
  isOnboarding: isOnboard = false,
  isInModal = false,
  isHidePadding = false,
}: {
  isOnboarding?: boolean;
  isInModal?: boolean;
  isHidePadding?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const iap = useIAPContext();
  const t = useTranslation();
  const [monthly, setMonthly] = useState<PaymentPlan>();
  const [quarterly, setQuarterly] = useState<PaymentPlan>();
  const [yearly, setYearly] = useState<PaymentPlan>();
  const [retries, setRetries] = useState(0);

  const subscriptions = iap.subscriptions;

  useEffect(() => {
    if (subscriptions.length) {
      console.log($lf(56), "Have Subscriptions");
      subscriptions.forEach((sub) => {
        const plan = getPaymentPlan(sub);
        if (sub.productId === subscriptionIds.monthly) setMonthly(plan);
        else if (sub.productId.includes("quarterly")) setQuarterly(plan);
        else if (sub.productId.includes("yearly")) setYearly(plan);
      });
    } else
      retries < 3 &&
        getSubscriptions({
          skus: Object.values(
            isAndroid ? androidSubscriptionIds : iosSubscriptionIds,
          ),
        })
          .then((s) => {
            s.forEach((sub) => {
              console.log($lf(72), "Got Subscriptions");
              const plan = getPaymentPlan(sub);
              if (sub.productId === subscriptionIds.monthly) setMonthly(plan);
              else if (sub.productId.includes("quarterly")) setQuarterly(plan);
              else if (sub.productId.includes("yearly")) setYearly(plan);
            });
          })
          .catch(async (e) => {
            await new Promise((res, rej) => {
              setTimeout(() => res(true), 1000);
            });
            console.log($lf(83), e);
            setRetries((r) => r + 1);
          });
  }, [iap.connected, subscriptions.length, retries]);

  console.log($lf(88), { monthly, quarterly, yearly });

  const [selectedSubscription, setSelectedSubscription] = useState(0);

  const BENEFITS = [
    {
      id: 1,
      title: t("Platform.Payment.Benefits.1"),
    },
    {
      id: 2,
      title: t("Platform.Payment.Benefits.2"),
    },
    {
      id: 3,
      title: t("Platform.Payment.Benefits.3"),
    },
    {
      id: 4,
      title: t("Platform.Payment.Benefits.4"),
    },
    {
      id: 5,
      title: t("rbrbwp70bng"),
    },
  ];

  /**
  *  const handleActivateTrial = useCallback(async () => {
    if (!quarterly) return;

    try {
      await requestSubscription({
        sku: quarterly.productId,
      });
    } catch (error) {
      console.error($lf(124), "Purchase error:", error);
    }
  }, [quarterly]);
  */

  const handlePurchase = useCallback(async () => {
    if (!monthly || !yearly) return;
    try {
      const sku =
        selectedSubscription === 0
          ? monthly.productId
          : selectedSubscription === 1
          ? quarterly!.productId
          : yearly.productId;
      const subscriptionOffers: SubscriptionOffer[] = [];
      if (isAndroid) {
        const offerToken =
          selectedSubscription === 0
            ? monthly.offerToken
            : selectedSubscription === 1
            ? quarterly!.offerToken
            : yearly.offerToken;

        offerToken && subscriptionOffers.push({ sku, offerToken });
        console.log($lf(148), subscriptionOffers);
        await requestSubscription({ subscriptionOffers });
      } else {
        await requestSubscription({ sku });
      }
    } catch (error) {
      console.error($lf(154), "Purchase error:", error);
    }
  }, [monthly, quarterly, yearly, selectedSubscription]);

  const handleContinue = useCallback(async () => {
    if (router.canDismiss()) router.dismissAll();

    if (isOnboard) {
      storage.set("onboarding.step", 6);
    } else {
    }
  }, [isOnboard]);

  const getMonthlyPriceToPerDay = useCallback(() => {
    const currentMonth = new Date().getMonth();
    const daysInMonth = new Date(
      new Date().getFullYear(),
      currentMonth + 1,
      0,
    ).getDate();

    const pricePerDay =
      parseFloat(monthly?.price || monthlyPrice) / daysInMonth;

    return `$${pricePerDay.toFixed(2)}`;
  }, [monthly]);

  const getQuarterlyPriceToPerDay = useCallback(() => {
    const pricePerDay = parseFloat(quarterly?.price || quarterlyPrice) / 90;

    return `$${pricePerDay.toFixed(2)}`;
  }, [quarterly]);

  const getYearlyPriceToPerDay = useCallback(() => {
    const pricePerDay = parseFloat(yearly?.price || yearlyPrice) / 365;

    return `$${pricePerDay.toFixed(2)}`;
  }, [yearly]);

  const showThreePlans = true;

  if (!monthly || !yearly) {
    return <LoadingScreen className="h-full bg-background" />;
  }

  return (
    <View className="flex-1">
      <ScrollView
        className={cn(
          "bg-background px-4 relative flex flex-col pt-14",
          colorScheme === "dark" && "bg-zinc-900",
          isOnboard && "pt-0",
          isInModal &&
            `pt-0 bg-white ${colorScheme === "dark" && "bg-zinc-900"}`,
          isHidePadding && "pt-0",
        )}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row items-center justify-between">
          {isOnboard && (
            <Press onPress={() => storage.set("onboarding.step", 6)}>
              <XIcon />
            </Press>
          )}

          <Press onPress={() => alert("Purchases Restored")}>
            <SFText
              className={cn(
                "text-sm font-medium",
                colorScheme === "dark" && "text-white",
              )}
              style={{
                fontFamily: FONT_FAMILY.Poppins_500Medium,
              }}
            >
              {t("iyvsu3kd39")}
            </SFText>
          </Press>
        </View>

        <Image
          source={require("@/assets/images/match.png")}
          className="h-48 w-48 mx-auto mt-4"
          contentFit="contain"
        />

        <SFText
          className={cn(
            "text-center text-xl font-bold mt-4",
            colorScheme === "dark" && "text-white",
          )}
          style={{
            fontFamily: FONT_FAMILY.Poppins_700Bold,
          }}
        >
          {t("b93sx0utvp")}
        </SFText>

        <SFText
          className={cn(
            "text-center text-sm px-8 mt-1 text-zinc-700",
            colorScheme === "dark" && "text-white",
          )}
          style={{
            fontFamily: FONT_FAMILY.Poppins_500Medium,
          }}
        >
          {t("4odzc3fd1mg")}
        </SFText>

        <View
          className={cn(
            "flex flex-row items-center justify-between mt-4",
            !showThreePlans && "justify-center",
          )}
        >
          <Plan
            plan={monthly}
            isOnboarding={false}
            onPress={() => setSelectedSubscription(0)}
            isSelected={selectedSubscription === 0}
          />

          {showThreePlans && (
            <Plan
              plan={quarterly}
              isOnboarding={false}
              onPress={() => setSelectedSubscription(1)}
              isSelected={selectedSubscription === 1}
            />
          )}

          {!showThreePlans && <View className="mx-2" />}

          <Plan
            plan={yearly}
            isOnboarding={false}
            onPress={() => setSelectedSubscription(2)}
            isSelected={selectedSubscription === 2}
          />
        </View>

        <SFText
          className={cn(
            "text-center text-sm mt-4 px-10 text-zinc-700",
            colorScheme === "dark" && "text-white",
          )}
          style={{
            fontFamily: FONT_FAMILY.Poppins_500Medium,
          }}
        >
          {selectedSubscription === 0
            ? `${t("vx5nsnnnm9")} ${getMonthlyPriceToPerDay()} ${
                monthly.currency
              } ${t("se6v1jl67eh")}\n${t("qh41c5mzxh")}`
            : selectedSubscription === 1
            ? `${t(
                "vx5nsnnnm9",
              )} ${getQuarterlyPriceToPerDay()} ${quarterly?.currency} ${t(
                "se6v1jl67eh",
              )}\n${t("4m0n0m72yr7")}`
            : `${t("vx5nsnnnm9")} ${getYearlyPriceToPerDay()} ${
                yearly.currency
              } ${t("se6v1jl67eh")}\n${t("qh41c5mzxh")}`}
        </SFText>

        <View
          className={cn(
            "mt-4 w-full border-zinc-200 border rounded-2xl p-4",
            colorScheme === "dark" && "border-zinc-800",
          )}
        >
          <View className="flex flex-row items-center justify-between">
            <SFText
              className={cn(
                "text-center text-base",
                colorScheme === "dark" && "text-white",
              )}
              style={{
                fontFamily: FONT_FAMILY.Poppins_700Bold,
              }}
            >
              {t("wr6lfrskarp")}
            </SFText>

            <View className="flex flex-row items-center">
              <SFText
                className={cn(
                  "text-center text-zinc-700 text-base",
                  colorScheme === "dark" && "text-white",
                )}
                style={{
                  fontFamily: FONT_FAMILY.Poppins_600SemiBold,
                }}
              >
                {t("rday5acxina")}
              </SFText>

              <SFText
                className={cn("text-center ml-4 text-blue underline text-base")}
                style={{
                  fontFamily: FONT_FAMILY.Poppins_700Bold,
                }}
              >
                {t("f6ug8gc8ud")}
              </SFText>
            </View>
          </View>

          <View
            className={cn(
              "w-full h-px bg-zinc-200 my-2",
              colorScheme === "dark" && "bg-zinc-800",
            )}
          />

          <View>
            {BENEFITS.map((benefit) => (
              <View
                key={benefit.id}
                className="flex flex-row items-center justify-between mb-2"
              >
                <SFText
                  className={cn(
                    "text-sm text-zinc-700 flex-1",
                    colorScheme === "dark" && "text-white",
                  )}
                  style={{
                    fontFamily: FONT_FAMILY.Poppins_600SemiBold,
                  }}
                >
                  {benefit.title}
                </SFText>

                <View className="flex flex-row items-center justify-between w-[100px] ml-4 pr-6">
                  <View className="-ml-2">
                    <Feather
                      name="x"
                      size={20}
                      color={colorScheme === "dark" ? "#71717a" : "#a1a1aa"}
                    />
                  </View>

                  <Feather name="check" size={20} color="#2563eb" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className={cn(
          "absolute bottom-0 left-0 right-0 px-2 py-2 bg-background border-t border-zinc-200 z-10",
          colorScheme === "dark" && "bg-zinc-900 border-zinc-800",
        )}
      >
        <Button
          onPress={handlePurchase}
          variant="primary"
          customStyle={cn("w-full py-4 mb-2 bg-blue", isOnboard && "mb-4")}
        >
          <SFText
            className="text-center text-white"
            style={{
              fontFamily: FONT_FAMILY.Poppins_700Bold,
            }}
          >
            {t("77a3otz6ent")}
          </SFText>
        </Button>

        {isOnboard && !showThreePlans && (
          <Button
            variant="secondary"
            onPress={handleContinue}
            customStyle="mb-4 py-4"
          >
            <SFText
              className="text-center text-blue"
              style={{
                fontFamily: FONT_FAMILY.Poppins_600SemiBold,
              }}
            >
              {t("q9bf9f6nkpj")}
            </SFText>
          </Button>
        )}
      </View>

      <View className="h-20" />
    </View>
  );
}

function $lf(n: number) {
  return "$lf|payment/index.tsx:" + n + " >";
}
