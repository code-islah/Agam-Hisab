const root = document.querySelector('#root');
const { useState, useEffect, createContext, useContext, useRef, Fragment } = React;

const { Route, Switch, HashRouter, NavLink } = ReactRouterDOM;

const AppContext = createContext();

function getLogin() {
  const raw = localStorage.getItem('login');
  return raw ? JSON.parse(raw) : null;
}


const Header = ({logout}) => {

  const { data, setData, navLocker, setNavLocker, loginPageToggler, setLoginPageToggler } = useContext(AppContext);
  const [infoPageToggler, setInfoPageToggler] = useState(false);
  const [settingsPageToggler, setSettingsPageToggler] = useState(false);
  const [visiblePassOnLogged,setVisiblePassOnLogged] = useState(false);
  const DOMRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleLoginClick(e) {
      e.stopPropagation();
      if (DOMRef.current && !DOMRef.current.contains(e.target)) {
        setLoginPageToggler(false);
      }
    }

    document.addEventListener("click", handleLoginClick);

    return () => {
      document.removeEventListener("click", handleLoginClick);
    }
  }, []);


  // Settings
  const [selectedCat, setSelectedCat] = useState('');
  const [toggleCatSelect, setToggleCatSelect] = useState(false);
  const [editingItem, setEditingItem] = useState('');
  const [editValues, setEditValues] = useState({});
  const [themeToggler, setThemeToggler] = useState(false);
  const [markedCategory, setMarkedCategory] = useState("");
  const [newItem, setNewItem] = useState({
    'name': "",
    'unit': "",
    "price": "",
    "company": ""
  });


  // Form Handling
  const [passwordVisibilityToggler, setPasswordVisibilityToggler] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    loginAt: new Date().toDateString()
  });


  function handleLoginSubmit(e) {

    if (!loginForm.email || !loginForm.password) {
      return;
    }
    localStorage.setItem("login", JSON.stringify(loginForm));

    setLoginForm({
      email: "",
      password: "",
      loginAt: new Date().toDateString()
    });
  }

  function handleLoginValuesChange(e) {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  }


  function handleSave() {
    setData(prev => {
      return prev.map(cat => {
        const catName = Object.keys(cat)[0];
        if (catName !== selectedCat) {
          return cat;
        }
        return {
          [catName]: cat[catName].map((item, idx) => {
            return (item.name + idx) === editingItem ? editValues : item
          })
        }
      })
    })
  }


  function handleAddItem() {
    if (!newItem.name) {
      return;
    }
    setData(prev => {
      return prev.map(cat => {
        const catName = Object.keys(cat)[0];

        if (catName === selectedCat) {
          return {
            [catName]: [...cat[catName], newItem]
          }
        }
        return cat;
      });
    });

    setNewItem({
      'name': "",
      'unit': "",
      "price": "",
      "company": ""
    });
  }


  function handleAddCategory(cateName) {
    if (!cateName) {
      return;
    }
    setData(prev => [
      ...prev, {
        [cateName]: []
      }
      ]);

    setSelectedCat(cateName);
  }


  function handleRemoveCategory(categ) {
    setData(prev => {
      return prev.filter(cat => {
        return Object.keys(cat)[0] !== categ;
      })
    })
    setSelectedCat(null);
  }


  function handleRemoveItem(itemToRemove) {
    setData(prev => {
      return prev.map(cat => {
        const catName = Object.keys(cat)[0];

        if (catName !== selectedCat) {
          return cat;
        }

        return {
          [catName]: cat[catName].filter((item, idx) => {
            return (item.name + idx) !== itemToRemove;
          })
        }

      })
    });
    setEditingItem(null);
  }


   function backupDataAsJSON() {
     const json = JSON.stringify(data, null, 2);
     
     const blob = new Blob([json],{
       type: "application/json"
     });
     
     const url = URL.createObjectURL(blob);
     
     const a = document.createElement("a");
     a.href = url;
     a.download = `AgamHisabBackup_${new Date().toDateString().split(" ").join("-")}.json`;
     a.click();
     
     URL.revokeObjectURL(url);
   }
   
   function handleRestore(e) {
     const file = e.target.files[0];
     if (!file) {
       return;
     }
     const reader = new FileReader();
     
     reader.onload = ()=>{
       try{
         const parsed = JSON.parse(reader.result);
         setData(parsed);
       } catch {
         console.error('Invalid Backup file!');
       }
     }
     reader.readAsText(file);
   }

  return (
    <header>
    <div className="logo">
    <h3>আগাম হিসাব</h3>
    <h6>{new Date().toDateString()}</h6>
    <div>
    <img onClick={(e)=>{
      e.stopPropagation();
      setLoginPageToggler(prev => !prev);
    }} src={getLogin() ? 'imgs/user-logged.svg': 'imgs/user.svg'} alt="User" />
    <img onClick={(e)=>{
    e.stopPropagation();
      setInfoPageToggler(prev => !prev);
    }} src="/imgs/info.svg" alt="Info" />
    <img onClick={(e)=>{
    e.stopPropagation();
      setSettingsPageToggler(prev => !prev);
      if (settingsPageToggler) {
        setToggleCatSelect(false);
        setSelectedCat(null);
      }
    }} src="/imgs/settings.svg" alt="settings" />
    </div>
    
    
    {loginPageToggler &&
    <div className="loginForm">
    { !getLogin() ?
    <form onSubmit={(e)=>{
      e.preventDefault();
      handleLoginSubmit();
    }} ref={DOMRef}>
    <div>
    <h2> Login Form </h2>
    <div>
    <label htmlFor="email">Email:</label>
    <input onChange={handleLoginValuesChange} name="email" type="email" placeholder="Enter email..."/>
    </div>
        <div style={{position: "relative"}}>
       <label htmlFor="password">Password:</label>
       <input onChange={handleLoginValuesChange} name="password" type={passwordVisibilityToggler? "password":"text"} placeholder="Enter password..."/>
       <span onClick={()=>{
         setPasswordVisibilityToggler(prev => !prev)
       }} className="passwordVisibilityToggler">{passwordVisibilityToggler ? '◉':'◯'}</span>
    </div>
    <div style={{marginBottom: '10px'}}>
    <button type="reset">Reset</button>
    <button type="submit">Submit</button>
    </div>
    <p onClick={(e)=>{
    e.target.parentElement.parentElement.email.focus();
    }}>Forget Password? Create a new one!</p>
    <p style={{fontSize: ".6rem", color: "crimson", width: '50ch'}}>* once you have an account you have all the access to use this app.</p>
    <p style={{fontSize: ".6rem", color: "#fff", width: '50ch'}}>The Database you get by login is not actually permament, your browser will store your all data inside indexedDB. So dont reset your browser without having a backup.</p>
    </div>
    </form>
    :
    <div>
    <div className="ifLoggedIn">
    <div style={{display: "flex", alignItems: 'end',gap: '5px'}}><h2>{(JSON.parse(localStorage.getItem('login')).email).split("@")[0]},</h2><p>You are set!</p></div>
    <div style={{display: 'flex',gap: '5px',alignItems: 'center'}}><p>{visiblePassOnLogged ? JSON.parse(localStorage.getItem('login')).password : "*****"}</p><div onClick={()=>{setVisiblePassOnLogged(prev => !prev)}}>{visiblePassOnLogged ? "⊙":"⊖"}</div></div>
    <p>{(JSON.parse(localStorage.getItem("login")).loginAt).split("T")[0]}</p>
    <div style={{marginTop: '20px'}}></div>
    <div><h5 style={{marginBottom: "5px"}}>Your Database has : </h5><h6>
     {data.reduce((acc,key) => {
       return acc + Object.keys(key).length
    },0)} Categories, {
      data.reduce((acc, obj)=>{
        const itemsArr = Object.values(obj)[0];
        return acc + itemsArr.length;
      },0)
    } Items. </h6></div>
    <p style={{fontSize: ".6rem", color: "#fff", width: '50ch'}}>The Database you get by login is not actually permament, your browser will store your all data inside indexedDB. So dont reset your browser without having a backup.</p>
    <p style={{fontSize: ".6rem", color: "crimson", width: '50ch'}}>* Once you logout of this account you wont be able to recover it anymore. Because this is a temporary account, it stays as long as you use the same browser or app environment.</p>
    <button onClick={logout}>Logout</button>
    <div style={{display: 'grid', gridAutoFlow: 'column',gap: '5px'}}> <button onClick={backupDataAsJSON}>Backup</button> <button onClick={()=>{
      fileInputRef.current.click();
    }}>Restore</button> <input type="file" accept="application/json" ref={fileInputRef} onChange={handleRestore} style={{display: 'none'}}/></div>
    </div>
    </div>}
    </div>}
    
    
    
    {infoPageToggler && <div className="infoPage">
     <h2>You should know:</h2>
     <ul>
     This app helps you to maintain :
      <li>
      The current market price.
      </li>
      <li>The daily budget.</li>
      <li>Categorized list of all items for your shop.</li>
      <li>An electrical resources of your goods.
      </li>
      <li>Track the expences.</li>
      <li>Lock: Click lock/unlock icons to toggle swiping left and right.</li>
      <li>Use its official App for offline mode.</li>
      <li>Send your review/feature suggestions <a href="mailto:alaminkhan00710@gmail.com">here</a>.</li>
      
     </ul>
     <p style={{fontSize: ".8rem", marginTop: '20px'}}>
      Created with React by Md Alamin.
     </p>
     
    </div>}
  
  
  
  
  
    
    {settingsPageToggler && <div className="settingsPage">
    
    <div className={getLogin() ? 'ifNotLogged none' : 'ifNotLogged'}><p>Please, login to have a database for your shop!</p></div>
     <h3> Edit your workplace: </h3>
    
    <div className="catSelect">
    <div>Select Category / Add</div>
   <div className={selectedCat  ? "selected" : ""} onClick={(e)=>{
      setToggleCatSelect(prev => !prev);
    }}>{selectedCat || '▼'}

    {toggleCatSelect && <div onClick={(e)=> { 
    setSelectedCat(e.currentTarget.textContent);
   }}>+ Add</div>}
  
   {toggleCatSelect && data.map((name) => {
     const catName = Object.keys(name)[0];
     return (<div
      className={catName === markedCategory ? "selectToCorfimBeforeRemove" : ""}
      key={catName}
      onClick={()=> setSelectedCat(catName)}>
    {catName} 
    <span onClick={(e)=>{
      e.stopPropagation();
      setMarkedCategory(e.target.parentElement.textContent.replace("×", "").trim());
      
    }}>&times;</span>
    {catName === markedCategory && <div className="removeCateConfirmActions">
    <button onClick={(e)=>{
    e.stopPropagation();
      handleRemoveCategory(markedCategory);
    }}>Confirm</button>
    <button onClick={(e)=>{
    e.stopPropagation();
     setMarkedCategory('');
    }}>Cancel</button>
    </div>}
     </div>)
   })
   }
   
   </div>
   {selectedCat === "+ Add" && <div className="addNewInput"> <input type="text" placeholder="Add Category" />
      <div onClick={(e)=> { 
    setSelectedCat(e.currentTarget.textContent);
    handleAddCategory(e.target.previousElementSibling.value);
   }}>+ Add</div>
   <div onClick={()=>{
     setSelectedCat(false);
   }}>Cancel</div>
   </div> }
   </div>
   
   
   <div>
   <div>Select Item / Add / Edit</div>
   { selectedCat && selectedCat !== "+ Add" &&
     <div className="selectedItems">
     <div className="editItemsTheme"><span onClick={()=>{
       setThemeToggler(false);
     }}></span><span onClick={()=>{
       setThemeToggler(true);
     }}></span></div>
     <input type="text" value={newItem.name} onChange={(e)=>{
       setNewItem({...newItem, name: e.target.value});
     }} placeholder="Add Item" />
     <input value={newItem.value} onChange={(e)=>{
       setNewItem({...newItem, unit: e.target.value});
     }} type="text" placeholder="Unit" />
     <input type="text" value={newItem.price} onChange={(e)=>{
       setNewItem({...newItem, price: e.target.value});
     }} placeholder="Price" />
     <input type="text" value={newItem.company} onChange={(e)=>{
       setNewItem({...newItem, company: e.target.value});
     }} placeholder="Comp.." />
     <div className="editActions">
     <button onClick={handleAddItem}>Save</button>
     <button>Reset</button>
     <button onClick={()=>{
     setSelectedCat(null);
     }}>Cancel</button>
     </div>
     </div>
   }
    {
      data.map(keys => {
      const name = Object.keys(keys)[0];
      if (name === selectedCat) {
      return keys[name].map((item,idx) => {
 
     const editId = item.name + idx;
     const isEditing = editingItem === editId;
     return <div onClick={(e)=>{
     e.stopPropagation();
   
     setEditingItem(editId);
     setEditValues(item);
   
 }} className={`selectedItems ${themeToggler ? 'transparentTheme': ""}`} key={item+idx}>


  <span> {isEditing ? (<input
 value={editValues.name}
 onChange={(e)=>{
   setEditValues(prev => ({
     ...prev,
     name: e.target.value
   }))
 }}
 />) : (item.name)
 } </span>
 
 
  <span style={{fontSize: ".8rem",fontWeight: 700}}>
  {isEditing? <input 
  value={editValues.unit}
  onChange={(e)=>{
    setEditValues(prev => ({
      ...prev,
      unit: e.target.value
    }))
  }}
  /> : (item.unit.toUpperCase())
  }</span>
  
  
  <span style={{fontWeight: 800}}>
  {isEditing? (
 <input
 value={editValues.price}
 onChange={(e)=> {
  setEditValues(prev => ({
    ...prev,
    price: e.target.value
  })) 
 }}
 />) :
 (item.price)
  }</span>
  
  
  <span style={{fontSize: '.75rem', color: 'rgba(255,255,255,0.5)',textDecoration: "underline"}}>
  {
   isEditing ? <input 
   value={editValues.company || ''}
   onChange={(e)=>{
     setEditValues(prev => ({
       ...prev,
       company: e.target.value
     }))
   }}
   /> : (item.company)
  }</span>
  
  {isEditing && <div className="editActions">
  <button onClick={()=>{
  handleSave();
  setEditingItem(null);
  }
  }>Save</button>
  <button onClick={()=>{
    setEditingItem(null);
    setSelectedCat(false);
  }}>Cancel</button>
  <button onClick={()=>{
    handleRemoveItem(item.name + idx);
  }}>Remove</button>
  </div>}
  
  </div>
   })
  }
})}
    </div>
    </div> 
    }
    
    </div>
    <nav>
    <ul>
    <li className={window.location.hash === "#/invoice" ? "active" : ""}><NavLink replace exact to="/">Summary</NavLink></li>
    <li><NavLink replace to="/invoice">Invoice</NavLink></li>
    <li><NavLink replace to="/history">History</NavLink></li>
    <div onClick={()=>{setNavLocker(prev => !prev)}} className="pageLocker">
    <img src={navLocker ? "/imgs/unlocker.svg" : "/imgs/locker.svg"}/>
    </div>
    </ul>
    </nav>
    </header>
  )
}


const RoutedMain = () => {

  return (
    <Switch>
   <Route exact path="/" component={Main} />
   <Route path="/invoice" component={Invoice} />
   <Route path="/history" component={History} />
   </Switch>
  )

}



const Main = () => {

  const {
    data,
    setData,
    selected,
    setSelected,
    quantity,
    setQuantity,
    budgetVal,
    setBudgetVal,
    totalAmount,
    setTotalAmount,
    searchedVal,
    setSearchedVal,
    itemUnit,
    getItemUnit,
    hydrated,
    setHydrated
  } = useContext(AppContext);

  const [welcomeMsg, setWelcomeMsg] = useState(() => {
    const isLoadedOnce = localStorage.getItem('ifLoadedOnce') === null ? false : true;
    if (!isLoadedOnce) {
      localStorage.setItem('ifLoadedOnce', true);
      return true;
    } else {
      return false;
    }
  });


  function RenderWelcome() {

    const title = 'Agam Hisab,';
    const subTitle = "Your next artificial business ally!";

    const [typedTitle, setTypedTitle] = useState('');
    const [typedSubTitle, setTypedSubTitle] = useState('');
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
      let idx = 0;

      const int = setInterval(() => {
        setTypedTitle(prev =>
          prev + title[idx]
        );

        idx++;

        if (idx === title.length - 1) {
          clearInterval(int);
        }
      }, 100);

      return () => {
        clearInterval(int);
      }
    }, []);


    useEffect(() => {
      let idx = -1;

      const int = setInterval(() => {
        setTypedSubTitle(prev =>
          prev + subTitle[idx]
        );

        idx++;

        if (idx === subTitle.length - 1) {
          clearInterval(int);
          setTimeout(() => {
            setIsAnimated(true);
          }, 1000)
        }
      }, 100);

      return () => {
        clearInterval(int);
      }
    }, []);


    return (<div className={`${welcomeMsg ? 'welcomeMsg': ""} ${isAnimated ? "isAnimated" : ""}`}>
    <h1>{typedTitle}</h1>
    <p>{typedSubTitle}</p>
    </div>)
  }


  useEffect(() => {
    async function bootstrap() {
      const dbData = await loadShopData();

      if (dbData && dbData.length) {
        setData(dbData);
      } else {
        try {
          const res = await fetch('data/database.json');
          const seedData = await res.json();

          setData(seedData);
          await saveShopData(seedData);
        } catch {
          setData([]);
        }
      }

      setHydrated(true);
    }
    bootstrap();
  }, []);

  function handleBudgetValue() {

    return budgetVal > 0 ? budgetVal - Object.values(totalAmount).reduce((acc, item) => {
      return acc + item
    }, 0) : budgetVal || "0";
  }

  const budgetClass = budgetVal ? 'budget added' : 'budget';
  return (
    <div className={`app-wrapper ${welcomeMsg ? "animateIt" : ""}`}>
    
    {welcomeMsg && <RenderWelcome/>}
    
    <div className="selections">
     <select onChange={(e)=>{
       setSelected(e.target.value)
     }} name="group" id="group">
     <option>Category</option>
    {data.map((elem, idx) => {
    return  Object.keys(elem).map(key => {
    return <option key={key+idx} value={key}>{key}</option>
      })
    })}
    
     </select>
      <div>
      <input 
      onFocus={(e)=>{e.target.placeholder = ""}}
      onBlur={(e)=>{e.target.placeholder = "Budget..."}}
      className={budgetClass}
      type="number"
      placeholder="Budget..."
      onChange={(e)=> setBudgetVal(e.target.value)}
      value={budgetVal}
      />
      <div className="budgetSummary">
      <div><span>Items</span><span>{Object.values(quantity).filter(item => item > 0).length || "0"}</span></div>
      <div><span>Total</span><span>{
      
      Object.values(totalAmount).reduce((acc, item) => {
        return acc + item
      },0)
        
      }</span>
      </div>
      <div>
      <span className={handleBudgetValue() < 0 ? 'budgetNeg' : 'budgetPos'}>Left</span>
      <span>{handleBudgetValue() === typeof number ? handleBudgetValue().toFixed(2) : handleBudgetValue()}</span>
      </div>
      </div>
      </div>
    </div>
    
     <div className="searchBar">
     <input onInput={(e=>{setSearchedVal(e.target.value)})} type="text" placeholder="Enter keyword..." />
   
     <select name="group" id="group">
     <option>Supplier</option>
     </select>
     
     <select name="group" id="group">
     <option>Company</option>
     </select>
  
     </div>
    
    <div>
      <table>
      <thead>
    <tr>
      <th>Sr.</th>
      <th>Name</th>
      <th>Unit</th>
      <th>Price</th>
      <th className="inputCell">Quant.</th>
      <th>Total</th>
    </tr>
    </thead>
    <tbody>
    
   {
   data.map((catObj,catIdx)=>{
   
    const catName = Object.keys(catObj)[0];
    
    if (selected) {
      if (catObj[selected] === undefined) {
      return;
    }
     const products = catObj[selected];
    }
    
     const products = catObj[catName];
     

    return products
       .map(item => ({
    ...item,
    _match: item.name
      .normalize("NFC")
      .toLowerCase()
      .includes(
        searchedVal
        .normalize("NFC")
        .toLowerCase()
      )
      }))
       .sort((a, b) => b._match - a._match)
       .map((item,itemIdx)=>{
       return (
       <tr key={`${catIdx} - ${itemIdx}`}>
       <td className="serial">{itemIdx +1}</td>
       <td className="nameCell" data-companylogo={item.company || ""}>
       {item.name}
       </td>
       <td className="unit">{item.unit.toUpperCase()}</td>
       <td>{item.price}</td>
       <td><input onInput={(e)=> {
       const val = Number(e.target.value);
       
       setTotalAmount(prev => ({
         ...prev,
         [item.name]: val * [item.price]
       }));
       
       setQuantity(prev => ({
         ...prev,
         [item.name]: val
       }));
       
       getItemUnit(prev => ({
         ...prev,
         [item.name]: item.unit
       }));
         
       }}
       type="number"
       placeholder="0"
       value={quantity[item.name] || ''}
       /></td>
       <td className="total">{(Number(totalAmount[item.name])  || 0).toFixed(2)}</td>
       </tr>
       )
     })
   })}
     
    </tbody>
    <tfoot>
    </tfoot>
  </table>
    </div>
    </div>
  )
}


const Invoice = () => {

  const { data, setData, quantity, setQuantity, totalAmount, setTotalAmount, itemUnit, getItemUnit } = useContext(AppContext);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("history");
    return saved ? JSON.parse(saved) : [];
  });


  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  return (
    <div className="invoice">
   <div>
   <h1> Invoice </h1>
   
   </div>
   { Object.keys(quantity).length > 0 ? (<>
   <table>
    
      <thead>
    <tr>
      <th>Sr.</th>
      <th>Name</th>
      <th>Price</th>
      <th>Quantity</th>
      <th>Total</th>
    </tr>
    </thead>
    <tbody>
    
   {Object.keys(quantity).map((item,idx)=>{
     return <tr key={`${item}+${idx}`}>
     <td className="serial">{idx + 1}</td>
     <td>{Object.keys(quantity)[idx]}</td>
     <td>{totalAmount[item] / quantity[item] || 0}</td>
     <td>{quantity[item]}</td>
     <td>{totalAmount[item]}</td>
     </tr>
   })}
     
    </tbody>
    <tfoot>
    <tr>
    <td></td>
    <td className="total">Total :</td>
    <td></td>
    <td>{Object.keys(quantity).length}</td>
    <td className="total amount">{Object.values(totalAmount).reduce((acc, item) => {
  return acc + item
}, 0).toFixed(2)}</td>
</tr>
    </tfoot>
    </table>
    <div className="invoice-tools">
    <button onClick={() => window.print()}><img src="/imgs/print.svg" alt="Print" /></button>
    <button onClick={()=>{
      
      const items = [];
      let grandTotal = 0;
      
      Object.keys(quantity).forEach((name,idx) => {
        const qnty = quantity[name];
        
        grandTotal += totalAmount[name];
        if (qnty <= 0) {
          return null;
        }
        
        items.push({
          name,
          unit: itemUnit[name],
          quantity: qnty,
          total: Number(totalAmount[name]).toFixed(2)
        });
        
      });
      
              if (items.length === 0) {
          return null;
        }

        const historyEntry = {
          'Sr.': history.length + 1,
          date: new Date().toDateString() + " " + new Date().toTimeString().split("GMT").shift(),
          total: grandTotal,
          items
        }

        setHistory(prev => ([
          ...prev,
          historyEntry
        ]));
        
        setQuantity("");
        window.location.reload();
      
    }}><img src="imgs/save.svg" alt="Save" /></button>
    </div>
   </>): <h2>You havn't selected any item!</h2>}
    </div>

  )
}


const History = () => {

  const [historyData, setHistoryData] = useState([]);
  const [activeRow, setActiveRow] = useState(null);



  function handleHistoryData(history) {
    return history.map((itemRow, idx) => {

      const isOpen = activeRow === idx;

      return <tr key={`${itemRow} + ${idx}`}>
    
      <td>{itemRow["Sr."]}</td>
      <td style={{fontSize: ".8rem", fontWeight: "800"}}>{itemRow.date}</td>
      <td>{itemRow.total}</td>
      <td>
       <div 
       className={`history-summary ${isOpen ? "separate-history-summary" : ""}`}
       onClick={()=> {
       setActiveRow(idx);
       window.scrollTo({top: 0, behavior: "smooth"});
       }}
       >{!isOpen && "ⅈ"}
       
      {isOpen && <div className="history-summary-close"
      onClick={(e)=> {e.stopPropagation(); setActiveRow(null)}}>
      &times;
      </div>}
      
       <table className="history-table-popup" key={idx}>
       
       {isOpen && <thead>
        <tr>
        <th>Name</th>
        <th>Unit</th>
        <th>Price</th>
        <th>Quantity</th>
        <th>Total</th>
        </tr>
        </thead>}
        
      {isOpen && itemRow.items.map((item,idx) => {
      
        return  <tbody key={item + idx}>
        <tr>
        <td>{item.name}</td>
        <td>{item.unit}</td>
        <td>{Number(item.total / item.quantity).toFixed(2)}</td>
        <td>{item.quantity}</td>
        <td>{Number(item.total).toFixed(2)}</td>
        </tr>
        </tbody>
  
      })}
         { isOpen && <tfoot >
            <tr style={{background: "rgba(0,0,0,0.05)"}}>
            <td></td>
            <td></td>
            <td></td>
            <td>Total</td>
            <td>{itemRow.items.reduce((acc, item)=> {
              return acc + item.total;
            },0)}</td>
            </tr>
        </tfoot> 
         }
        </table>
        </div>
      </td>
      </tr>

    })
  }

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('history'));

    if (history) {
      setHistoryData(history);
    }
  }, [])

  return (
    <div className="history">
    <h1> History </h1>
    <div>
   
     <table className="history-table">
     <thead>
    <tr>
      <th>Sr.</th>
      <th>Date</th>
      <th>Total</th>
      <th>View</th>
    </tr>
    </thead>
    <tbody>
    
  {handleHistoryData(historyData)} 
     
    </tbody>
    <tfoot>
    </tfoot>
    </table>
    </div>
    </div>
  )
}


const Footer = () => {
  return (
    <footer>
    <h6>
    @ Agam Hisab {new Date().getFullYear()}, <a href="#">View Source</a>.
    </h6>
    </footer>
  )
}


const routes = ["/", "/invoice", "/history"];

const SwipeNavigation = ({ children }) => {

  const location = window.location.hash.replace("#", "") || "/";
  let touchStartX = 0;
  let touchEndX = 0;
  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }

  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }

  const handleSwipe = () => {
    const threshold = 100;
    const currentIndex = routes.indexOf(window.location.href.split("#")[1]);

    if (touchEndX < touchStartX - threshold) {

      const nextIndex = currentIndex === routes.length - 1 ? 0 : currentIndex + 1;
      window.location.replace("#" + routes[nextIndex]);

    } else if (touchEndX > touchStartX + threshold) {

      const prevIndex = currentIndex === 0 ? routes.length - 1 : currentIndex - 1;
      window.location.replace("#" + routes[prevIndex]);
    }

  }

  return (
    <div
   onTouchStart={handleTouchStart}
   onTouchEnd={handleTouchEnd}
   style={{width: "100%", height: "100%"}}>
   {children}
   </div>
  )
}



function App() {

  const [navLocker, setNavLocker] = useState(true);
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState({});
  const [budgetVal, setBudgetVal] = useState('');
  const [totalAmount, setTotalAmount] = useState({});
  const [searchedVal, setSearchedVal] = useState("");
  const [itemUnit, getItemUnit] = useState({});
  const [loginPageToggler, setLoginPageToggler] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadShopData().then(dbData => {
      if (dbData) {
        setData(dbData);
      }

      setHydrated(false);
    })
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveShopData(data);
  }, [data, hydrated]);


  useEffect(() => {
    if (data.length) {
      saveShopData(data);
    }
  }, [data]);

  function getDBName() {
    const login = getLogin();
    return login ? `shopDB_${login.email}` : null;
  }

  async function enforceAuthDB() {
    const login = getLogin();

    if (!login) {
      const dbs = await indexedDB.databases();

      for (const db of dbs) {
        if (db.name.startsWith("shopDB_")) {
          indexedDB.deleteDatabase(db.name);
        }
      }
      console.log("There is no login information nor database!");
    }
  }

  useEffect(() => {
    enforceAuthDB();
  }, []);

  function logOut() {
    const db = getDBName();
    localStorage.removeItem("login");

    if (db) {
      indexedDB.deleteDatabase(db);
    }
    window.location.reload();
  }


  return (
    <HashRouter>
   <AppContext.Provider value={{navLocker,
   setNavLocker,
   data,
   setData,
   selected,
   setSelected,
   quantity,
   setQuantity,
   budgetVal,
   setBudgetVal,
   totalAmount,
   setTotalAmount,
   searchedVal,
   setSearchedVal,
   itemUnit,
   getItemUnit,
   loginPageToggler,
   setLoginPageToggler,
   hydrated,
   setHydrated
   }}>

   {navLocker ? (
  <SwipeNavigation>
   <Header logout={logOut} /> 
   <main>
   {navLocker ? <RoutedMain /> : <Main />}
   </main>
   <Footer />
   </SwipeNavigation>
   ) : (
   <Fragment>
      <Header /> 
   <main>
   {navLocker ? <RoutedMain /> : <Main />}
   </main>
   <Footer />
   </Fragment>
   )}

   </AppContext.Provider>
   </HashRouter>
  )
}




ReactDOM.createRoot(root).render(
  <App />
);