export function transformFields(payload: any) {
  return {
    ...payload,
    transformed: true,
    receivedAt: new Date().toISOString(),
  };
}

export function enrichMetadata(payload: any, pipelineId: string) {
  return {
    data: payload,
    metadata: {
      pipelineId,
      processedAt: new Date().toISOString(),
      payloadSize: JSON.stringify(payload).length,
    },
  };
}

export function filterImportantFields(payload: any) {
  return {
    customer: payload.customer ?? null,
    order: payload.order ?? null,
  };
}