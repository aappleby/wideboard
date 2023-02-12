export interface DragTarget {
  onDragBegin(x : number, y : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) : void;
  onDragUpdate(x : number, y : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) : void;
  onDragCancel(x : number, y : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) : void;
  onDragEnd(x : number, y : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) : void;
  onMouseWheel(x : number, y : number, delta : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) : void;
  onMouseClick(x : number, y : number, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) : void;
  onKeyDown(key : string, shiftKey : boolean, ctrlKey : boolean, altKey : boolean) : void;
};
