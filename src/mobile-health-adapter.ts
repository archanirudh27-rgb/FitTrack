import { Health } from '@capgo/capacitor-health';

const READ_TYPES:any[]=[
  'steps','distance','distanceCycling','calories','heartRate','restingHeartRate',
  'heartRateVariability','sleep','oxygenSaturation','respiratoryRate','workouts'
];

const safe=async<T>(fn:()=>Promise<T>,fallback:T):Promise<T=>{
  try{return await fn()}catch(err){console.warn('FitTrack health metric unavailable',err);return fallback}
};

function localDay(value:string){
  const d=new Date(value),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function avg(sum:number,count:number){return count?sum/count:null}

async function readSummary({startTime,endTime}:{startTime:string,endTime:string}){
  const daily=new Map<string,any>();
  const get=(day:string)=>{
    if(!daily.has(day))daily.set(day,{date:day,steps:0,distanceKm:0,activeCalories:0,_walkKm:0,_cycleKm:0,_hrvSum:0,_hrvCount:0,_spo2Sum:0,_spo2Count:0,_respSum:0,_respCount:0});
    return daily.get(day);
  };

  const [steps,distance,cycling,calories,heart,resting,sleep,hrv,spo2,resp,workouts]=await Promise.all([
    safe(()=>Health.queryAggregated({dataType:'steps',startDate:startTime,endDate:endTime,bucket:'day',aggregation:'sum'}),{samples:[]}),
    safe(()=>Health.queryAggregated({dataType:'distance',startDate:startTime,endDate:endTime,bucket:'day',aggregation:'sum'}),{samples:[]}),
    safe(()=>Health.queryAggregated({dataType:'distanceCycling',startDate:startTime,endDate:endTime,bucket:'day',aggregation:'sum'}),{samples:[]}),
    safe(()=>Health.queryAggregated({dataType:'calories',startDate:startTime,endDate:endTime,bucket:'day',aggregation:'sum'}),{samples:[]}),
    safe(()=>Health.queryAggregated({dataType:'heartRate',startDate:startTime,endDate:endTime,bucket:'day',aggregation:['average','min','max']}),{samples:[]}),
    safe(()=>Health.queryAggregated({dataType:'restingHeartRate',startDate:startTime,endDate:endTime,bucket:'day',aggregation:'average'}),{samples:[]}),
    safe(()=>Health.readSamples({dataType:'sleep',startDate:startTime,endDate:endTime,limit:500,ascending:true}),{samples:[]}),
    safe(()=>Health.readSamples({dataType:'heartRateVariability',startDate:startTime,endDate:endTime,limit:500,ascending:true}),{samples:[]}),
    safe(()=>Health.readSamples({dataType:'oxygenSaturation',startDate:startTime,endDate:endTime,limit:500,ascending:true}),{samples:[]}),
    safe(()=>Health.readSamples({dataType:'respiratoryRate',startDate:startTime,endDate:endTime,limit:500,ascending:true}),{samples:[]}),
    safe(()=>Health.queryWorkouts({startDate:startTime,endDate:endTime,limit:100,ascending:false}),{workouts:[]})
  ]);

  for(const s of (steps as any).samples||[])get(localDay(s.startDate)).steps+=Number(s.value||0);
  for(const s of (distance as any).samples||[])get(localDay(s.startDate))._walkKm+=Number(s.value||0)/1000;
  for(const s of (cycling as any).samples||[])get(localDay(s.startDate))._cycleKm+=Number(s.value||0)/1000;
  for(const s of (calories as any).samples||[])get(localDay(s.startDate)).activeCalories+=Number(s.value||0);
  for(const s of (heart as any).samples||[]){const d=get(localDay(s.startDate)),v=s.values||{};d.avgHeartRate=v.average??s.value??null;d.minHeartRate=v.min??null;d.maxHeartRate=v.max??null}
  for(const s of (resting as any).samples||[])get(localDay(s.startDate)).restingHeartRate=Number(s.value||0)||null;

  for(const s of (sleep as any).samples||[]){
    const d=get(localDay(s.endDate||s.startDate)),minutes=Number(s.value||0);
    d.sleepMinutes=(d.sleepMinutes||0)+minutes;
    if(Array.isArray(s.stages)&&s.stages.length){
      for(const st of s.stages){
        const m=Number(st.durationMinutes||0),name=String(st.stage||'').toLowerCase();
        if(name==='deep')d.deepSleepMinutes=(d.deepSleepMinutes||0)+m;
        else if(name==='rem')d.remSleepMinutes=(d.remSleepMinutes||0)+m;
        else if(name==='light'||name==='asleep')d.lightSleepMinutes=(d.lightSleepMinutes||0)+m;
        else if(name==='awake')d.awakeMinutes=(d.awakeMinutes||0)+m;
      }
    }else{
      const name=String(s.sleepState||'').toLowerCase();
      if(name==='deep')d.deepSleepMinutes=(d.deepSleepMinutes||0)+minutes;
      else if(name==='rem')d.remSleepMinutes=(d.remSleepMinutes||0)+minutes;
      else if(name==='light'||name==='asleep')d.lightSleepMinutes=(d.lightSleepMinutes||0)+minutes;
      else if(name==='awake')d.awakeMinutes=(d.awakeMinutes||0)+minutes;
    }
  }

  for(const s of (hrv as any).samples||[]){const d=get(localDay(s.startDate));d._hrvSum+=Number(s.value||0);d._hrvCount++}
  for(const s of (spo2 as any).samples||[]){const d=get(localDay(s.startDate));d._spo2Sum+=Number(s.value||0);d._spo2Count++}
  for(const s of (resp as any).samples||[]){const d=get(localDay(s.startDate));d._respSum+=Number(s.value||0);d._respCount++}

  const days=[...daily.values()].map(d=>({
    date:d.date,
    steps:Math.round(d.steps||0),
    distanceKm:Number((Number(d._walkKm||0)+Number(d._cycleKm||0)).toFixed(3)),
    activeCalories:Number(Number(d.activeCalories||0).toFixed(1)),
    restingHeartRate:d.restingHeartRate??null,
    avgHeartRate:d.avgHeartRate??null,
    minHeartRate:d.minHeartRate??null,
    maxHeartRate:d.maxHeartRate??null,
    hrvRmssdMs:avg(d._hrvSum,d._hrvCount),
    sleepMinutes:d.sleepMinutes??null,
    deepSleepMinutes:d.deepSleepMinutes??null,
    remSleepMinutes:d.remSleepMinutes??null,
    lightSleepMinutes:d.lightSleepMinutes??null,
    awakeMinutes:d.awakeMinutes??null,
    spo2Avg:avg(d._spo2Sum,d._spo2Count),
    respiratoryRateAvg:avg(d._respSum,d._respCount),
    sourceSystem:'health_connect'
  })).sort((a,b)=>a.date.localeCompare(b.date));

  const mapType=(type:string)=>{
    const t=String(type||'').toLowerCase();
    if(t==='walking'||t==='hiking')return'walk';
    if(t==='running')return'run';
    if(t==='cycling'||t==='handcycling')return'cycle';
    return null;
  };
  const sessions=((workouts as any).workouts||[]).map((w:any)=>{
    const type=mapType(w.workoutType);if(!type)return null;
    const distanceKm=Number(w.totalDistance||0)/1000,durationSeconds=Number(w.duration||0);
    return{
      externalId:w.platformId||`${w.sourceId||'health'}-${w.startDate}-${w.workoutType}`,
      type,
      startTime:w.startDate,
      endTime:w.endDate,
      durationSeconds,
      distanceKm,
      avgSpeedKmh:durationSeconds?distanceKm/(durationSeconds/3600):0,
      avgPaceMinPerKm:type!=='cycle'&&distanceKm?(durationSeconds/60)/distanceKm:null,
      calories:Number(w.totalEnergyBurned||0),
      steps:null,
      sourceSystem:'health_connect'
    };
  }).filter(Boolean);

  return{days,sessions};
}

const FitTrackHealth={
  async isAvailable(){return Health.isAvailable()},
  async requestPermissions(){
    const status:any=await Health.requestAuthorization({read:READ_TYPES,write:[],requestHistoryAccess:false});
    return{granted:true,readAuthorized:status?.readAuthorized||[],readDenied:status?.readDenied||[]};
  },
  readSummary
};

(window as any).fitTrackNativeHealth=FitTrackHealth;
console.log('FitTrack native Health Connect adapter ready');
