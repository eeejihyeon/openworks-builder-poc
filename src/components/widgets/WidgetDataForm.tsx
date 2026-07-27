import type { CSSProperties } from 'react';
import { useCallback, useMemo } from 'react';

import type { WidgetDataSelection } from '@/types/container';
import { createEmptyWidgetData } from '@/types/container';
import {
  getDataKeyOption,
  getDataTypeOption,
  getDataTypeNode,
  WIDGET_DATA_SCHEMA,
} from '@/constants/widgetDataSchema';

type WidgetDataFormProps = {
  value: WidgetDataSelection;
  onChange: (next: WidgetDataSelection) => void;
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const labelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
};

const controlStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: '12px',
  color: '#334155',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
};

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '12px',
  borderTop: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '12px',
  fontWeight: 600,
  color: '#334155',
};

const hintStyle: CSSProperties = {
  margin: 0,
  fontSize: '11px',
  color: '#94a3b8',
  lineHeight: 1.4,
};

const WidgetDataForm = ({ value, onChange }: WidgetDataFormProps) => {
  const typeNode = useMemo(() => getDataTypeNode(value.type), [value.type]);
  const dataKeyOption = useMemo(
    () => getDataKeyOption(value.type, value.dataKey),
    [value.type, value.dataKey]
  );
  const dataTypeOption = useMemo(
    () => getDataTypeOption(value.type, value.dataKey, value.dataType),
    [value.type, value.dataKey, value.dataType]
  );

  const handleTypeChange = useCallback(
    (type: string) => {
      onChange({
        ...createEmptyWidgetData(),
        type: type || null,
      });
    },
    [onChange]
  );

  const handleDataKeyChange = useCallback(
    (dataKey: string) => {
      onChange({
        type: value.type,
        dataKey: dataKey || null,
        dataType: null,
        values: {},
      });
    },
    [onChange, value.type]
  );

  const handleDataTypeChange = useCallback(
    (dataType: string) => {
      onChange({
        type: value.type,
        dataKey: value.dataKey,
        dataType: dataType || null,
        values: {},
      });
    },
    [onChange, value.type, value.dataKey]
  );

  const handleFieldChange = useCallback(
    (key: string, fieldValue: string) => {
      onChange({
        ...value,
        values: {
          ...value.values,
          [key]: fieldValue,
        },
      });
    },
    [onChange, value]
  );

  return (
    <div style={formStyle}>
      <h3 style={titleStyle}>Widget Data</h3>
      <p style={hintStyle}>type → dataKey → dataType 스키마 기반 동적 폼</p>

      <label style={fieldStyle}>
        <span style={labelStyle}>type</span>
        <select
          style={controlStyle}
          value={value.type ?? ''}
          onChange={(event) => handleTypeChange(event.target.value)}
        >
          <option value=''>선택</option>
          {WIDGET_DATA_SCHEMA.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
      </label>

      <label style={fieldStyle}>
        <span style={labelStyle}>dataKey</span>
        <select
          style={controlStyle}
          value={value.dataKey ?? ''}
          disabled={!typeNode}
          onChange={(event) => handleDataKeyChange(event.target.value)}
        >
          <option value=''>선택</option>
          {typeNode?.dataKeys.map((key) => (
            <option key={key.id} value={key.id}>
              {key.label}
            </option>
          ))}
        </select>
      </label>

      <label style={fieldStyle}>
        <span style={labelStyle}>dataType</span>
        <select
          style={controlStyle}
          value={value.dataType ?? ''}
          disabled={!dataKeyOption}
          onChange={(event) => handleDataTypeChange(event.target.value)}
        >
          <option value=''>선택</option>
          {dataKeyOption?.dataTypes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {dataTypeOption?.fields.map((field) => (
        <label key={field.key} style={fieldStyle}>
          <span style={labelStyle}>{field.label}</span>
          {field.input === 'select' ? (
            <select
              style={controlStyle}
              value={value.values[field.key] ?? ''}
              onChange={(event) =>
                handleFieldChange(field.key, event.target.value)
              }
            >
              <option value=''>선택</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              style={controlStyle}
              type={field.input === 'number' ? 'number' : 'text'}
              value={value.values[field.key] ?? ''}
              onChange={(event) =>
                handleFieldChange(field.key, event.target.value)
              }
            />
          )}
        </label>
      ))}
    </div>
  );
};

export default WidgetDataForm;
