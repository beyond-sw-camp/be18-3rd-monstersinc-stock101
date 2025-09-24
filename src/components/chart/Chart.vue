<template>
  <div>
    <LineChart :chart-data="chartData" :chart-options="chartOptions" />
    <button @click="connect">해외주식 실시간 연결 시작</button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue"
import { Line as LineChart } from "vue-chartjs"
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement,
  PointElement, CategoryScale, LinearScale
} from "chart.js"

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({
  ticker: { type: String, required: true },
  exchange: { type: String, default: "" },
  label: { type: String, default: "" }
})

const datasetLabel = computed(() => {
  if (!props.ticker) return "실시간 체결가"
  return props.label || `${props.ticker} 실시간 체결가`
})

const trKey = computed(() => {
  if (!props.ticker) return ""
  if (props.ticker.includes("@")) return props.ticker
  return props.exchange ? `${props.ticker}@${props.exchange}` : props.ticker
})

// 차트 데이터 구조
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: datasetLabel.value,
      data: [],
      borderColor: "rgb(255,99,132)",
      tension: 0.1
    }
  ]
})

watch(datasetLabel, (nextLabel) => {
  chartData.value.datasets[0].label = nextLabel
})

const resetChart = () => {
  chartData.value.labels = []
  chartData.value.datasets[0].data = []
}

watch(trKey, (nextKey, prevKey) => {
  resetChart()

  if (!nextKey) {
    disconnect()
    return
  }

  if (prevKey && ws?.readyState === WebSocket.OPEN) {
    connect(true)
  }
})

const chartOptions = ref({
  responsive: true,
  animation: false
})

let ws = null

const approvalKey = ref("")

async function fetchApprovalKey() {
  if (approvalKey.value) {
    return approvalKey.value
  }

  try {
    const response = await fetch("/api/v1/rest-client/sendWSkey")
    if (!response.ok) {
      throw new Error(`Approval key request failed with status ${response.status}`)
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (contentType.includes("application/json")) {
      const payload = await response.json()
      approvalKey.value = payload?.approvalKey || payload?.approval_key || ""
    } else {
      approvalKey.value = (await response.text()).trim()
    }

    if (!approvalKey.value) {
      throw new Error("Approval key response was empty")
    }

    return approvalKey.value
  } catch (error) {
    console.error("승인 키를 가져오지 못했습니다.", error)
    throw error
  }
}

// 웹소켓 연결 함수
async function connect(forceReconnect = false) {
  if (!trKey.value) {
    console.warn("구독할 티커가 필요합니다.")
    return
  }

  if (ws) {
    const isOpen = ws.readyState === WebSocket.OPEN
    const isConnecting = ws.readyState === WebSocket.CONNECTING
    if (!forceReconnect && (isOpen || isConnecting)) {
      console.info("이미 WebSocket 연결이 진행 중입니다.")
      return
    }
    disconnect()
  }

  const url = "wss://openapi.koreainvestment.com:9443/websocket"
  ws = new WebSocket(url)

  ws.onopen = async () => {
    console.log("해외주식 WebSocket 연결 성공")

    let key
    try {
      key = await fetchApprovalKey()
    } catch {
      ws?.close()
      return
    }

    // 해외주식 체결가 구독 메시지
    const message = {
      header: {
        approval_key: key,
        custtype: "P", // 개인
        tr_type: "1",  // 등록
        content: {
          tr_id: "HDFSASP0", // 해외주식 실시간 체결가 (시장별 다름)
          tr_key: trKey.value // 종목코드@거래소 (테슬라@나스닥)
        }
      }
    }
    ws?.send(JSON.stringify(message))
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const price = data?.body?.output?.last // 해외주식 현재가 필드 예시
      if (price) {
        updateChart(price)
      }
    } catch (e) {
      console.error("데이터 파싱 오류:", e)
    }
  }

  ws.onerror = (err) => console.error("WebSocket 오류:", err)
  ws.onclose = () => {
    console.log("WebSocket 연결 종료")
    ws = null
  }
}

function disconnect() {
  if (!ws) return
  ws.onopen = null
  ws.onmessage = null
  ws.onerror = null
  ws.onclose = null
  try {
    ws.close()
  } catch (err) {
    console.error("WebSocket 종료 중 오류:", err)
  }
  ws = null
}

// 차트 갱신
function updateChart(price) {
  const now = new Date().toLocaleTimeString()

  chartData.value.labels.push(now)
  chartData.value.datasets[0].data.push(Number(price))

  if (chartData.value.labels.length > 50) {
    chartData.value.labels.shift()
    chartData.value.datasets[0].data.shift()
  }
}

onBeforeUnmount(disconnect)

defineExpose({ connect, disconnect })
</script>
