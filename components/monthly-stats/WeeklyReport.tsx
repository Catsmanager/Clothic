import type { WeekData } from '../../lib/weeklyStats'
import TopColorsCard from './TopColorsCard'
import TopItemsCard from './TopItemsCard'
import WeeklyOutfitsCard from './WeeklyOutfitsCard'

interface Props {
  data: WeekData
  weekStart: Date
}

export default function WeeklyReport({ data, weekStart }: Props) {
  return (
    <>
      <WeeklyOutfitsCard
        totalOutfits={data.totalOutfits}
        diffFromLastWeek={data.diffFromLastWeek}
        weekStart={weekStart}
        recordedDates={data.recordedDates}
      />
      <TopColorsCard label="이번 주 자주 입은 색상" topColors={data.topColors} />
      <TopItemsCard label="이번 주 많이 입은 아이템 TOP 3" topItems={data.topItems} showRank />
    </>
  )
}
