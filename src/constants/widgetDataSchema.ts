export type WidgetDataField = {
  key: string;
  label: string;
  input: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
};

export type WidgetDataTypeOption = {
  id: string;
  label: string;
  fields: WidgetDataField[];
};

export type WidgetDataKeyOption = {
  id: string;
  label: string;
  dataTypes: WidgetDataTypeOption[];
};

export type WidgetDataTypeNode = {
  id: string;
  label: string;
  dataKeys: WidgetDataKeyOption[];
};

/**
 * type → dataKey → dataType 3단 cascading 스키마 (POC)
 */
export const WIDGET_DATA_SCHEMA: WidgetDataTypeNode[] = [
  {
    id: 'sensor',
    label: '센서',
    dataKeys: [
      {
        id: 'temperature',
        label: '온도',
        dataTypes: [
          {
            id: 'realtime',
            label: '실시간',
            fields: [
              { key: 'unit', label: '단위', input: 'select', options: [
                { value: 'celsius', label: '°C' },
                { value: 'fahrenheit', label: '°F' },
              ]},
              { key: 'refreshSec', label: '갱신(초)', input: 'number' },
            ],
          },
          {
            id: 'history',
            label: '이력',
            fields: [
              { key: 'range', label: '기간', input: 'select', options: [
                { value: '1h', label: '1시간' },
                { value: '24h', label: '24시간' },
                { value: '7d', label: '7일' },
              ]},
            ],
          },
        ],
      },
      {
        id: 'gas',
        label: '가스 농도',
        dataTypes: [
          {
            id: 'threshold',
            label: '임계값',
            fields: [
              { key: 'warn', label: '경고', input: 'number' },
              { key: 'alarm', label: '알람', input: 'number' },
            ],
          },
          {
            id: 'stream',
            label: '스트림',
            fields: [
              { key: 'channel', label: '채널', input: 'text' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'media',
    label: '미디어',
    dataKeys: [
      {
        id: 'cctv',
        label: 'CCTV 스트림',
        dataTypes: [
          {
            id: 'rtsp',
            label: 'RTSP',
            fields: [
              { key: 'url', label: 'URL', input: 'text' },
              { key: 'fps', label: 'FPS', input: 'number' },
            ],
          },
          {
            id: 'hls',
            label: 'HLS',
            fields: [
              { key: 'url', label: 'URL', input: 'text' },
            ],
          },
        ],
      },
      {
        id: 'map',
        label: '지도 타일',
        dataTypes: [
          {
            id: 'static',
            label: '정적',
            fields: [
              { key: 'lat', label: '위도', input: 'number' },
              { key: 'lng', label: '경도', input: 'number' },
              { key: 'zoom', label: '줌', input: 'number' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'analytics',
    label: '분석',
    dataKeys: [
      {
        id: 'chart',
        label: '차트 시리즈',
        dataTypes: [
          {
            id: 'line',
            label: '라인',
            fields: [
              { key: 'metric', label: '메트릭', input: 'text' },
              { key: 'color', label: '색상', input: 'text' },
            ],
          },
          {
            id: 'bar',
            label: '바',
            fields: [
              { key: 'metric', label: '메트릭', input: 'text' },
            ],
          },
        ],
      },
      {
        id: 'table',
        label: '테이블 소스',
        dataTypes: [
          {
            id: 'query',
            label: '쿼리',
            fields: [
              { key: 'queryId', label: 'Query ID', input: 'text' },
              { key: 'pageSize', label: '페이지 크기', input: 'number' },
            ],
          },
        ],
      },
    ],
  },
];

export const getDataTypeNode = (typeId: string | null) =>
  WIDGET_DATA_SCHEMA.find((node) => node.id === typeId) ?? null;

export const getDataKeyOption = (typeId: string | null, dataKeyId: string | null) => {
  const typeNode = getDataTypeNode(typeId);

  if (!typeNode || !dataKeyId) {
    return null;
  }

  return typeNode.dataKeys.find((key) => key.id === dataKeyId) ?? null;
};

export const getDataTypeOption = (
  typeId: string | null,
  dataKeyId: string | null,
  dataTypeId: string | null
) => {
  const dataKey = getDataKeyOption(typeId, dataKeyId);

  if (!dataKey || !dataTypeId) {
    return null;
  }

  return dataKey.dataTypes.find((item) => item.id === dataTypeId) ?? null;
};
