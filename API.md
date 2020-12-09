# API Reference

**Classes**

Name|Description
----|-----------
[CFunction](#cfunctions-cfunction)|*No description*


**Structs**

Name|Description
----|-----------
[CFunctionProps](#cfunctions-cfunctionprops)|*No description*
[ExecOptions](#cfunctions-execoptions)|*No description*



## class CFunction  <a id="cfunctions-cfunction"></a>




### Initializer




```ts
new CFunction(props: CFunctionProps)
```

* **props** (<code>[CFunctionProps](#cfunctions-cfunctionprops)</code>)  *No description*
  * **capture** (<code>Map<string, any></code>)  Symbols to capture. __*Optional*__
  * **code** (<code>string</code>)  Javascript code to execute. __*Default*__: "true;"



### Properties


Name | Type | Description 
-----|------|-------------
**env** | <code>Map<string, string></code> | Environment variables that are expected to be available when the function is executed.
**outfile** | <code>string</code> | The location of the function bundle (.js file).

### Methods


#### toJson() <a id="cfunctions-cfunction-tojson"></a>



```ts
toJson(): any
```


__Returns__:
* <code>any</code>

#### *static* exec(file, options?) <a id="cfunctions-cfunction-exec"></a>



```ts
static exec(file: string, options?: ExecOptions): any
```

* **file** (<code>string</code>)  *No description*
* **options** (<code>[ExecOptions](#cfunctions-execoptions)</code>)  *No description*
  * **env** (<code>Map<string, string></code>)  Environment variables to bind to the child process. __*Default*__: {}

__Returns__:
* <code>any</code>



## struct CFunctionProps  <a id="cfunctions-cfunctionprops"></a>






Name | Type | Description 
-----|------|-------------
**capture**? | <code>Map<string, any></code> | Symbols to capture.<br/>__*Optional*__
**code**? | <code>string</code> | Javascript code to execute.<br/>__*Default*__: "true;"



## struct ExecOptions  <a id="cfunctions-execoptions"></a>






Name | Type | Description 
-----|------|-------------
**env**? | <code>Map<string, string></code> | Environment variables to bind to the child process.<br/>__*Default*__: {}



