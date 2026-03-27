const fs = require('fs');
let code = fs.readFileSync('react-code-v2.jsx', 'utf8');

// Inside FuchsNLZ Props
code = code.replace(
  "    openScoutModal,\n  }) => {\n    const [ageGroup, setAgeGroup] = useState(\"funino\"); // 'funino' | 'kleinfeld' | 'grossfeld'\n    // --- NEW NLZ MED-TECH STATE ---",
  "    openScoutModal,\n    ageGroup,\n    setAgeGroup\n  }) => {\n    // --- NEW NLZ MED-TECH STATE ---"
);

// Inside App State
code = code.replace(
  "  const [cfoTab, setCfoTab] = useState(\"zero-base\");\n  const [nlzTab, setNlzTab] = useState(\"dashboard\"); // Not currently hooked, fallback",
  "  const [cfoTab, setCfoTab] = useState(\"zero-base\");\n  const [nlzTab, setNlzTab] = useState(\"dashboard\"); // Not currently hooked, fallback\n  const [nlzAgeGroup, setNlzAgeGroup] = useState(\"funino\");"
);

fs.writeFileSync('react-code-v2.jsx', code);
console.log("Done");
