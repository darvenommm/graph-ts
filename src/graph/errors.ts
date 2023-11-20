export class ErrorNotFoundNode extends Error {
  message: string = 'The given node was not found in this graph!';
}

export class ErrorNodeExist extends Error {
  message: string = 'The given node exists in this graph!';
}

export class ErrorGraphTransformToPrimitive extends Error {
  message: string = 'The graph cannot be transformed to number!';
}
