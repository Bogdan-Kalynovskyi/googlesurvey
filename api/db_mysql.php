<?php
if (!defined('AUTHORISED')) {
    die();
}


class bDb {

    var $link; // this object the MysqL connection handle
    var $result = null;
    var $output = null;

    //var debug

    // The constructor. Get the mysql info vars and connect to the server
    function bDb ($db_host, $db_user, $db_pass, $db_name, $db_charset) {
        $this->link = @mysql_connect($db_host, $db_user, $db_pass, TRUE); // Connect to the MySQL server

        if (!$this->link) {
            trigger_error(mysql_error());
        }
        if (!@mysql_select_db($db_name, $this->link) || !@mysql_query("SET NAMES $db_charset", $this->link)) {
            trigger_error(mysql_error());
        }
    }

    
    function a ($str) {
        return mysql_real_escape_string('"'.$str.'"'); 
    }

//***************************************************************************
    function evaluate ($query_str) {

        $this->result = @mysql_query($query_str, $this->link);
        if ($this->result === false) {
            trigger_error(mysql_error() . ' ==>> ' . htmlentities($query_str));
        }

        return @mysql_result($this->result, 0, 0); // or trigger_error(var_dump...);
    }


//***************************************************************************
    // Perform the MySQL queries
    function query ($query_str, $multi = true, $smart = false) {

        $this->result = @mysql_query($query_str, $this->link); // Do the quer
        if ($this->result === false) {
            trigger_error(mysql_error() . ' ==>> ' . htmlentities($query_str));
            return null;
        }

        if (strtolower(substr(ltrim($query_str), 0, 6)) != 'select') { //SET //and others

            // Return the number of rows affected by this operation
            return mysql_affected_rows();

        }
        
        elseif (strtolower(substr(ltrim($query_str), 0, 6)) != 'insert') {
            
            // Return last id
            return mysql_insert_id();

        }


        // Return multiple rows stored in a multi dimensional array
        if ($multi) {

            // If the query was to get data, i.e, select, then return the data as arrays
            $this->output = array();
            $num = -1;

            while ($row = mysql_fetch_array($this->result, MYSQL_ASSOC)) {
                if ($smart) {
                    $num = array_shift($row);
                }
                else {
                    $num++;
                }

                $this->output[$num] = $row;
            }

            return $this->output; // Return the multi demensional array


        }

        // Return the result in a one dimensional array
        return mysql_fetch_array($this->result, MYSQL_ASSOC);


    }

//***********************************************************************************


    // Get the number of rows for a particular query
    function total_count () {
        return mysql_result(mysql_query("SELECT FOUND_ROWS()", $this->link), 0);
    }

    function row_count ($query_str) {
        $this->result = @mysql_query($query_str, $this->link);
        if ($this->result === false) {
            trigger_error(mysql_error() . ' ==>> ' . htmlentities($query_str));
            return null;
        }

        return @mysql_num_rows($this->result);
    }

} // End class


include_once "db_settings.php";

$db = new bDb($db_host, $db_user, $db_pass, $db_name, $db_charset);