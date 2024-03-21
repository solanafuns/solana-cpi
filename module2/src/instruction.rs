use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::invoke,
    pubkey::Pubkey,
};

solana_program::entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello CPI world, I'll call module1!");

    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let module1_program = next_account_info(account_info_iter)?;

    let instruction = Instruction {
        program_id: *module1_program.key,
        accounts: vec![AccountMeta::new(*payer.key, false)],
        data: vec![],
    };

    invoke(&instruction, &vec![payer.clone(), module1_program.clone()])?;

    // gracefully exit the program
    Ok(())
}
