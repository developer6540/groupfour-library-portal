import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { getDbConnection } from "@/lib/db";
import { insertApprovalRecord } from "@/services/book.service";

// ── Plan config ──────────────────────────────────────────────────────────────
const PLANS: Record<string, { subsType: string; months: number; amount: number }> = {
    MONTHLY: { subsType: "00001", months: 1,  amount: 500  },
    ANNUAL:  { subsType: "00002", months: 12, amount: 5000 },
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { usercode, plan } = body as { usercode?: string; plan?: string };

        // ── Validatimport { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
?mport { errorResponse, successResponse } from "@/lib/rcoimport Logger from "@/lib/logger";
import { getDbConnection } f  import { getDbConnection } from "uiimport { insertApprovalRecord } from "@/se}

// ── Plan config ─────────────.toconst PLANS: Record<string, { subsType: string; months: number; amount: number }> = {
    MONTHLY: { subsType: "00001", months: 1,  amount: 500  },
    ANNUAL:  { subsType: "00002", months: 12, amount: 5000 , ")}`, 400),
                { status: 400 }
            );
        }

        const po    ANNUAL:  { subsType: "00002", months: 12, amount: 5000 }─────────────────────???   try {
        const body = await request.json?       ??        const { usercode, plan } = body a  
        // ── Validatimport { NextRequest, Next  .input("code", usercode.trimimport { errorResponse, successResponse } from "@/lib/response";
?mport U_GROUP,?mport { errorResponse, successResponse } from "@/lib/rcoimpo Uimport { getDbConnection } f  import { getDbConnection } from "uiimport { insertApprovalRecoRO
// ── Plan config ─────────────.toconst PLANS: Record<string, { subsType: st  r    MONTHLY: { subsType: "00001", months: 1,  amount: 500  },
    ANNUAL:  { subsType: "00002", months: 12, amount: 5000 , ")}`, 400),
             ?   ANNUAL:  { subsType: "00002", months: 12, amount: 5000 ,??                { status: 400 }
            );
        }

        const??           );
        }

              }

  extend from t        const body = await request.json?       ??        const { usercode, plan } = body a  
        // ── Validatimport { NextRequest, Next  .inpve        // ── Validatimport { NextRequest, Next  .input("code", usercode.trimimport { errnt?mport U_GROUP,?mport { errorResponse, successResponse } from "@/lib/rcoimpo Uimport { getDbConnection } f  import { getDbConnection } from te// ── Plan config ─────────────.toconst PLANS: Record<string, { subsType: st  r    MONTHLY: { subsType: "00001", months: 1,  amount: 500  },
    .s    ANNUAL:  { subsType: "00002", months: 12, amount: 5000 , ")}`, 400),
             ?   ANNUAL:  { subsType: "00002", months: 12, amount: 5000 ,??                { s??            ?   ANNUAL:  { subsType: "00002", months: 12, amount: 50es            );
        }

        const??           );
        }

              }

  extend from t                  }

  ("
                  }

              }

  
      .que
  extend from           // ── Validatimport { NextRequest, Next  .inpve        // ── Vali            U_EXPIREDDATE = @    .s    ANNUAL:  { subsType: "00002", months: 12, amount: 5000 , ")}`, 400),
             ?   ANNUAL:  { subsType: "00002", months: 12, amount: 5000 ,??                { s??            ?   ANNUAL:  { subsType: "00002", months: 12, amount: 50es            );
        }

        const??           );
        }

              }

  extend from t                  }

  ("
                  }

        const approvalId = await insertApprovalRecord({
            userCod             ?   ANNUAL:  { subsType: "00002", months: 12, amount: 5000 ,??:         }

        const??           );
        }

              }

  extend from t                  }

  ("
                  }

              }

  
      .que
  extend from           
                  }

fig.amount,
       
       Amt
  extend from   
  ("
                  }

              
              }

nul
  
      .que ap ro  extend  "             ?   ANNUAL:  { subsType: "00002", months: 12, amount: 5000 ,??                { s??            ?   ANNUAL:  { subsType: "00002", months: 12, amount: 50es            );
        }

      ey        }

        const??           );
        }

              }

  extend from t                  }

  ("
                  }

        const approvalId = await insertApprovalRecord  
                  }

              }

  
          
  exxpiry:  newE
  ("
                  }

              
        const app               userCod             ?   ANNUAL:  { subsTct
        const??           );
        }

              }

  extend from t                  }

  ("
                 }

              }

  
       .er
  extend from (p
  ("
                  }

            et
              }

son
  
      .queerr rR  extend rror.message || "Internal S
fig.amount,
     r.s   us || 500  
            { st  ("
          tu   | 
              
        
