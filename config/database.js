module.exports = {
  hrPool: {
    user: "soadbuser",
    password: "S0aUs3r!",
    connectString: `(DESCRIPTION =
(CONNECT_TIMEOUT=120)(RETRY_COUNT=30)(RETRY_DELAY=10) (TRANSPORT_CONNECT_TIMEOUT=3)
(ADDRESS_LIST =
(LOAD_BALANCE=on)(FAILOVER=on)
(ADDRESS = (PROTOCOL = TCP)(HOST=ctx3-scan.wmata.com)(PORT=1521)))
(ADDRESS_LIST =
(LOAD_BALANCE=on)(FAILOVER=on)
(ADDRESS = (PROTOCOL = TCP)(HOST=jgx3-scan.wmata.com)(PORT=1521)))
(CONNECT_DATA=
(SERVICE_NAME = PHRPROD.wmata.com)
(FAILOVER_MODE = (TYPE = SELECT)(METHOD = BASIC)(RETRIES = 10)(DELAY = 1)))
)`,
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0,
    poolAlias: "hrPool",
  },
  /*hrPool: {
    user: "soadbuser",
    password: "S0aUs3r!",
    connectString: `(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = jgx2db01-vip)(PORT = 1521))) 
    (CONNECT_DATA = (SERVER = DEDICATED) (SERVICE_NAME =  PHRPAR1JGB.wmata.com)))`,
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0,
    poolAlias: "hrPool",
  },*/
  feedbackPool: {
    user: "apps_feedback",
    password: "App$F33dback$1",
    connectString: `(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = cteahdpdg03dv.wmata.local)(PORT = 1521))) 
    (CONNECT_DATA = (SERVER = DEDICATED) (SERVICE_NAME = edssorcl.wmata.local)))`,
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0,
    poolAlias: "feedbackPool",
  },
};
