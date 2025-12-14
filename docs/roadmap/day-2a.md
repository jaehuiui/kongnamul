# Day-2-α 

### [1] DSL은 무엇일까요?

바로 앞선 챕터에서 'DSL' 이라는 표현을 사용했습니다.  
라이브러리라는 작고 작은 하나의 도메인을 **설계, 디자인**하는 입장에서 어떤 의미인지는 **아주 얕고 가볍게**만 짚고 넘어가면 좋을 것 같습니다.

C, Java, Python, XML과 같이 범용적으로 사용되는 GPL(General Purpose Language)와 대조되는 개념으로,  
특정 영역에 한정되어 사용되는 컴퓨터 언어라고 합니다.  
물론 그 경계가 항상 명확하지는 않은 스펙트럼과 같은 개념일 것입니다.

DSL에는 SQL, CSS, HTML, MATLAB과 같이 말 그대로 특정 도메인에서만 사용되는 특정 도메인의 문제를 표현하기 위한 언어입니다.

여러 자료들을 읽고 고민해본 결과,
제가 이 글에서 DSL의 경계를 나누는 기준은 다음으로 정리해보겠습니다.

> DSL은 단순히 데이터(data)를 넘어 의미(semantics)를 가진 언어이고, 의미를 해석하기 위한 규칙과 제약이 수반됩니다.

그러면 JSX라는 조금 더 구체적인 예시를 들어보겠습니다.

'JSX도 UI를 설명하는 도메인 특화 언어가 아닐까요, JSX도 DSL이지 않나요?'

```jsx
// jsx
<h1>안녕하세요</h1>

// 컴파일 이후
React.createElement("h1", null, "안녕하세요")

// 런타임
{
  type: "h1",
  props: {},
  children: ["안녕하세요"]
}
```

제 관점에는 JSX는 자체는 어떠한 의미(semantics)를 정의하지는 않습니다.  
Preact, Solid와 같은 다른 런타임 환경에서도 재정의될 수 있기 때문입니다.

Babel이라는 transpiler가 단순히 구문 변환(syntactic desugaring)을 하는 것뿐입니다.  
어떠한 의미 판단이 들어가지도, 렌더링 제어도, 업데이트 전략도 포함하지 않습니다.  
컴파일러 레벨에서는 semantic phase가 없는 단순 macro expansion 입니다.

물론 그럼에도 JSX는 eDSL(embedded DSL)나 내부 DSL(internal DSL)로 분류된다고 하기도 합니다.

반대로 이런 예시가 schema가 DSL이 되는 케이스일겁니다,

```js
{
  type: "h1",
  children: ["안녕하세요"],
  when: "mounted",
  rerenderOn: ["user"],
  visibleIf: "windowOnRefetch"
}
```

이야기가 다소 길어지고 복잡해졌지만 한 번쯤 생각해봄직한 내용이었길 바랍니다.

[참고 자료]

- Martin Fowler의 DSL: https://www.martinfowler.com/dsl.html / https://www.martinfowler.com/articles/languageWorkbench.html#ExternalDsl
- DSL Wikipedia: https://en.wikipedia.org/wiki/Domain-specific_language
- Compiler design: https://www.geeksforgeeks.org/compiler-design/introduction-of-compiler-design/
