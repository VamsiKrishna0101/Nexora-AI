from typing import TypedDict
import operator
from typing import Annotated
from langgraph.graph import StateGraph, END

class State(TypedDict):
    val: Annotated[int, operator.add]

def start_node(s): return {"val": 1}
def n1(s): return {"val": 10}
def n2(s): return {"val": 100}

b = StateGraph(State)
b.add_node("start", start_node)
b.add_node("n1", n1)
b.add_node("n2", n2)
b.set_entry_point("start")
b.add_edge("start", "n1")
b.add_edge("n1", "n2")
b.add_edge("n2", END)

g = b.compile()
print("INVOKING...")
final = g.invoke({"val": 0})
print("FINAL:", final)

