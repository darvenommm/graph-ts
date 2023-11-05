export class ErrorNodeTransformToPrimitive extends Error {
  message: string = 'The node can be transformed only to string!';
}

export class ErrorEmptyNodeName extends Error {
  message: string = 'The node name cannot be a empty string!';
}
